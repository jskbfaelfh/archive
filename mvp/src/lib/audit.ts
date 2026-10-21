import { prisma } from './prisma';

export interface AuditParams {
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  target: string;
  details?: string | null;
  ipAddress?: string | null;
}

export async function logAuditEvent(params: AuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId || undefined,
        userName: params.userName || undefined,
        userRole: params.userRole || undefined,
        action: params.action,
        target: params.target,
        details: params.details || undefined,
        ipAddress: params.ipAddress || undefined,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
