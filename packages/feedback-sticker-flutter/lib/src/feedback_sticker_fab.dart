import 'package:flutter/material.dart';
import 'feedback_service.dart';

class FeedbackStickerFAB extends StatefulWidget {
  final FeedbackUser? currentUser;
  final String? projectId;
  final String? apiKey;
  final String? apiUrl;
  final String? currentScreenName;
  final bool isRtl;

  const FeedbackStickerFAB({
    super.key,
    this.currentUser,
    this.projectId,
    this.apiKey,
    this.apiUrl,
    this.currentScreenName,
    this.isRtl = true,
  });

  @override
  State<FeedbackStickerFAB> createState() => _FeedbackStickerFABState();
}

class _FeedbackStickerFABState extends State<FeedbackStickerFAB> {
  void _openFeedbackDialog() {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
    bool isSubmitting = false;

    showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return Directionality(
              textDirection: widget.isRtl ? TextDirection.rtl : TextDirection.ltr,
              child: AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                title: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.purple.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.sticky_note_2, color: Colors.purple),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      widget.isRtl ? 'أضف ملاحظة للنظام' : 'Submit Note',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                content: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextField(
                        controller: titleController,
                        decoration: InputDecoration(
                          labelText: widget.isRtl ? 'عنوان الملاحظة' : 'Title',
                          hintText: widget.isRtl ? 'أدخل عنواناً موجزاً...' : 'Enter brief title...',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: contentController,
                        maxLines: 4,
                        decoration: InputDecoration(
                          labelText: widget.isRtl ? 'تفاصيل الملاحظة' : 'Details',
                          hintText: widget.isRtl ? 'اكتب تفاصيل ملاحظتك هنا...' : 'Write your feedback here...',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ],
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: isSubmitting ? null : () => Navigator.pop(dialogContext),
                    child: Text(widget.isRtl ? 'إلغاء' : 'Cancel'),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.purple.shade700,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: isSubmitting
                        ? null
                        : () async {
                            final title = titleController.text.trim();
                            final content = contentController.text.trim();
                            if (title.isEmpty || content.isEmpty) return;

                            setDialogState(() => isSubmitting = true);

                            await FeedbackService.sendNote(
                              title: title,
                              content: content,
                              user: widget.currentUser,
                              projectId: widget.projectId,
                              apiKey: widget.apiKey,
                              apiUrl: widget.apiUrl,
                              pageRoute: widget.currentScreenName,
                            );

                            if (mounted) {
                              Navigator.pop(dialogContext);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    widget.isRtl
                                        ? 'تم إرسال الملاحظة بنجاح'
                                        : 'Note submitted successfully',
                                  ),
                                  backgroundColor: Colors.green.shade700,
                                ),
                              );
                            }
                          },
                    child: isSubmitting
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Text(widget.isRtl ? 'إرسال' : 'Send'),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: widget.isRtl ? 0 : null,
      right: widget.isRtl ? null : 0,
      top: MediaQuery.of(context).size.height * 0.45,
      child: GestureDetector(
        onTap: _openFeedbackDialog,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF7C3AED), Color(0xFF4F46E5)],
            ),
            borderRadius: BorderRadius.only(
              topRight: Radius.circular(widget.isRtl ? 12 : 0),
              bottomRight: Radius.circular(widget.isRtl ? 12 : 0),
              topLeft: Radius.circular(widget.isRtl ? 0 : 12),
              bottomLeft: Radius.circular(widget.isRtl ? 0 : 12),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.purple.withOpacity(0.35),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (widget.isRtl) ...[
                const Text(
                  'أضف ملاحظة',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.sticky_note_2, color: Colors.white, size: 18),
              ] else ...[
                const Icon(Icons.sticky_note_2, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                const Text(
                  'Add Note',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
