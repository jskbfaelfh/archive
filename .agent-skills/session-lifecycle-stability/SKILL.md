---
name: session-lifecycle-stability
description: Trigger this skill whenever implementing or modifying authentication lifecycle, session refresh listeners (Supabase onAuthStateChange, Firebase onAuthStateChanged, JWT refresh), window visibility/focus handlers, or protected route gates. Enforces zero session-wipeout on background token refresh, immune active user identity checks, and zero UI unmounting/data re-fetching on tab switching.
---

# مهارة استقرار دورة حياة الجلسة ومنع إعادة التحميل العشوائي (Session Lifecycle Stability)

## 1. فلسفة المهارة والهدف المعماري
تهدف هذه المهارة إلى القضاء التام على ظاهرة عدم الاستقرار وإعادة التحميل القسري (`Unnecessary Re-mount & Data Re-fetching`) التي تحدث عند مغادرة المستخدم لتبويب المتصفح أو نافذة التطبيق ثم العودة إليها.

في العديد من الأنظمة المعتمدة على مكتبات المصادقة (مثل Supabase أو Firebase أو JWT Auth Clients)، يقوم العميل تلقائياً عند استعادة التركيز (`window focus` أو `visibilitychange`) بفحص صلاحية الرمز وتجديده في الخلفية عبر أحداث مثل `onAuthStateChange` أو `TOKEN_REFRESHED`. إذا لم تتم إدارة هذا الحدث بوعي هندسي، يتم تصفير الجلسة في حالة React (`setSession(null)`)، مما يؤدي إلى:
1. انهيار شرط الحماية في البوابات (`PublicGate` / `ProtectedRoute`).
2. إلغاء تثبيت (`unmount`) شاشة العمل وفقدان مدخلات المستخدم وحالة التبويبات المفتوحة.
3. إعادة تثبيت الشاشة من الصفر (`remount`) وإعادة طلب كافة بيانات قاعدة البيانات وظهور مؤشرات التحميل المزعجة دون أي مبرر.

---

## 2. القواعد الحتمية للاستقرار (The Invariant Rules)

### القاعدة 1: حصانة الجلسة النشطة (Active Session Continuity Guard)
- **يُحظر تماماً** استدعاء `setSession(null)` أو رفع راية التحميل `setLoading(true)` عند ورود حدث تجديد رمز الجلسة لنفس المستخدم المسجل حالياً:
  ```ts
  // ✅ التحقق الحتمي قبل اتخاذ أي إجراء:
  const isSameUser = currentSession?.user?.id === candidate.user.id;
  if (isSameUser) {
    // الحفاظ على الجلسة الحالية كما هي دون تصفيرها أو إظهار شاشة تحميل
    setError(null);
  } else {
    // مستخدم جديد مختلف: يتم تصفير الجلسة وبدء التحميل
    setSession(null);
    setLoading(true);
  }
  ```

### القاعدة 2: التجديد السلس بالخلفية (Silent Background Refresh)
- تجديد الرموز والتحقق من الجلسة يتم بهدوء في الخلفية (`Silent Background Refresh`).
- عند نجاح التحقق، يتم تحديث بيانات الجلسة (`setSession(verified)`) مع الحفاظ على مرجع هوية المستخدم (`user.id`) ثابتاً، مما يمنع تشغيل خطافات `useEffect` المعتمدة على هوية المستخدم.

### القاعدة 3: الحصر الصارم لحالات الإلغاء (Strict Logout Invalidation)
- لا يتم تصفير الجلسة نهائياً وإلغاء حالة المصادقة إلا في الحالات التالية حصراً:
  1. حدث تسجيل خروج صريح ومؤكد (`event === 'SIGNED_OUT'`).
  2. انعدام كائن الجلسة تماماً (`!candidate`).
  3. فشل التحقق من صلاحية الجلسة على الخادم برمز خطأ أمني/صلاحيات (`permission` / `401` / `403`).

### القاعدة 4: عزل تبعيات جلب البيانات (Fetch Dependency Isolation)
- يجب أن تعتمد خطافات جلب البيانات (`useEffect`) على معرف المستخدم كقيمة نصية أولية (`user?.id`) وليس على كائن الرمز بالكامل (`session` أو `access_token`):
  ```ts
  // ❌ خطأ فادح: يتسبب في إعادة طلب البيانات مع كل تجديد للرمز
  useEffect(() => { fetchData(); }, [session]);

  // ✅ صحيح ومستقر: لا يعيد الطلب إلا إذا تغير المستخدم الفعلي
  useEffect(() => { fetchData(); }, [user?.id, retryTrigger]);
  ```

---

## 3. نمط التطبيق الهندسي المرجعي (Reference Implementation Pattern)

```tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const epoch = useRef(new RequestEpoch());
  const sessionRef = useRef<Session | null>(null);
  sessionRef.current = session;

  const settle = useCallback(async (ticket: number, candidate: Session | null) => {
    try {
      const verified = await verifySession(candidate);
      if (epoch.current.isCurrent(ticket)) {
        setSession(verified);
        setError(null);
      }
    } catch (failure) {
      if (epoch.current.isCurrent(ticket)) {
        setSession(null);
        setError(toRepositoryError(failure).message);
      }
    } finally {
      if (epoch.current.isCurrent(ticket)) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const guard = epoch.current;
    guard.open();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let unsubscribe: (() => void) | undefined;

    try {
      const client = getSupabaseClient();
      const initialTicket = guard.begin();

      const { data } = client.auth.onAuthStateChange((event, candidate) => {
        const ticket = guard.begin();
        const currentSession = sessionRef.current;

        // 1. تسجيل الخروج الصريح أو غياب الجلسة
        if (!candidate || event === 'SIGNED_OUT') {
          setSession(null);
          setError(null);
          setLoading(false);
          return;
        }

        // 2. فحص استمرارية المستخدم الحالي
        if (currentSession?.user?.id === candidate.user.id) {
          setError(null);
          // لا تصفير للجلسة ولا رفع لراية التحميل
        } else {
          setSession(null);
          setError(null);
          setLoading(true);
        }

        // 3. تسوية الرمز بعد فك قفل العميل
        const timer = setTimeout(() => {
          timers.delete(timer);
          void settle(ticket, candidate);
        }, 0);
        timers.add(timer);
      });

      unsubscribe = () => data.subscription.unsubscribe();
      // جلب الجلسة الابتدائية عند أول تشغيل
      void client.auth.getSession().then((result) => {
        if (!guard.isCurrent(initialTicket)) return;
        if (result.error) throw result.error;
        return settle(initialTicket, result.data.session);
      });
    } catch (err) {
      setSession(null);
      setLoading(false);
    }

    return () => {
      guard.close();
      unsubscribe?.();
      timers.forEach(clearTimeout);
    };
  }, [settle]);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 4. قائمة التحقق الإلزامية (Compliance Checklist)
- [ ] هل يتم الاحتفاظ بالجلسة عند أحداث `TOKEN_REFRESHED` أو تبديل النوافذ؟
- [ ] هل تظل مكونات الشاشة الرئيسية محتفظة بحالتها دون `unmount` عند فقدان التركيز والعودة؟
- [ ] هل تعتمد خطافات `useEffect` للبيانات على المعرفات الأولية (`user?.id`) بدلاً من كائنات الجلسة؟
- [ ] هل تمر الاختبارات الأحادية واختبارات العقود دون أخطاء أو تعليق؟
