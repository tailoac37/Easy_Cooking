"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { useAuth } from "@/app/contexts/AuthContext";
import { Comment } from "@/app/types/comment";

/* ================================
   TOKEN SAFE-GETTER (FIXED)
================================ */
function getAuthHeader() {
  const raw = localStorage.getItem("token");

  if (!raw || raw === "null" || raw === "undefined") {
    return { Authorization: "" }; // ⭐ luôn có key để tránh lỗi union
  }

  const token = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
  return { Authorization: token };
}

/* ================================
   FLATTEN COMMENT
================================ */
function flattenComments(list: any): Comment[] {
  if (!Array.isArray(list)) return [];

  const result: Comment[] = [];

  const walk = (items: any[]) => {
    items.forEach((c) => {
      if (!c || !c.commentID) return;

      result.push({
        commentId: c.commentID,
        parentId:
          c.parentCommentId === null || c.parentCommentId === 0
            ? null
            : c.parentCommentId,

        content: c.content || c.contents,
        createdAt: c.createAt,
        updateAt: c.updateAt,

        user: {
          fullName: c.userName,
          avatarUrl: c.avatarUrl,
          userId: c.userId,
        },

        replies: [],
      });

      if (Array.isArray(c.replies)) walk(c.replies);
    });
  };

  walk(list);
  return result;
}

/* ================================
   COMMENT ITEM
================================ */
function CommentItem({
  comment,
  onReplyClick,
  onDelete,
  onEdit,
  isReply = false,
}: any) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  return (
    <div className="flex items-start gap-4">

      {/* Avatar → Profile */}
      <Link href={`/user-profile/${comment.user.userId}`} className="flex-shrink-0">
        <img
          src={comment.user.avatarUrl}
          className={`rounded-full cursor-pointer hover:opacity-80 transition ${
            isReply ? "w-8 h-8" : "w-10 h-10"
          }`}
        />
      </Link>

      <div className="flex-1">
        <div className="flex justify-between">
          <Link
            href={`/user-profile/${comment.user.userId}`}
            className="font-semibold hover:underline cursor-pointer"
          >
            {comment.user.fullName}
          </Link>

          <span className="text-sm text-gray-500">{comment.createdAt}</span>
        </div>

        <p className="mt-2 whitespace-pre-line">{comment.content}</p>

        <div className="flex gap-4 mt-3 text-sm text-gray-500">
          {onReplyClick && (
            <button className="hover:text-orange-500" onClick={onReplyClick}>
              Trả lời
            </button>
          )}

          <button
            className={`flex items-center gap-1 ${
              liked ? "text-red-500" : "hover:text-orange-500"
            }`}
            onClick={() => {
              if (!user) return alert("Bạn cần đăng nhập!");
              setLiked((p) => !p);
              setLikeCount((p) => (liked ? p - 1 : p + 1));
            }}
          >
            <FaHeart size={13} /> {likeCount}
          </button>

          {user?.userId === comment.user.userId && (
            <button className="hover:text-blue-500" onClick={() => onEdit(comment)}>
              Sửa
            </button>
          )}

          {user?.userId === comment.user.userId && (
            <button
              className="hover:text-red-500"
              onClick={() => onDelete(comment.commentId)}
            >
              Xóa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================
   MAIN COMPONENT
================================ */
export default function Section9RecipeComments({ recipeId }: any) {
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newComment, setNewComment] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<Comment | null>(null);
  const [editText, setEditText] = useState("");

  /* LOAD COMMENTS */
  useEffect(() => {
    const fetchComments = async () => {
      const res = await fetch(`/api/proxy/recipes/${recipeId}/comments`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await res.json();
      setComments(flattenComments(data));
    };

    fetchComments();
  }, [recipeId]);

  /* ROOT + CHILDREN */
  const rootComments = useMemo(
    () => comments.filter((c) => c.parentId == null),
    [comments]
  );

  const getReplies = (id: number) =>
    comments.filter((c) => Number(c.parentId) === Number(id));

  /* CREATE COMMENT */
  const handleNewComment = async () => {
    if (!user) return alert("Bạn cần đăng nhập!");
    if (!newComment.trim()) return;

    const res = await fetch(`/api/proxy/recipes/${recipeId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        parentCommentId: null,
        contents: newComment,
      }),
    });

    const text = await res.text();
    let newCmt = null;

    try {
      newCmt = JSON.parse(text);
    } catch {}

    if (!newCmt || !newCmt.commentID) {
      const r = await fetch(`/api/proxy/recipes/${recipeId}/comments`);
      const d = await r.json();
      setComments(flattenComments(d));
      setNewComment("");
      return;
    }

    const parsed = flattenComments([newCmt]);
    setComments((prev) => [parsed[0], ...prev]);
    setNewComment("");
  };

  /* REPLY COMMENT */
  const handleReplySubmit = async (parentId: number) => {
    if (!user) return alert("Bạn cần đăng nhập!");
    if (!replyText.trim()) return;

    const res = await fetch(`/api/proxy/comments/${parentId}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ contents: replyText }),
    });

    const text = await res.text();
    let newReply = null;

    try {
      newReply = JSON.parse(text);
    } catch {}

    if (!newReply || !newReply.commentID) {
      const r = await fetch(`/api/proxy/recipes/${recipeId}/comments`);
      const d = await r.json();
      setComments(flattenComments(d));
      setReplyTo(null);
      return;
    }

    const parsed = flattenComments([newReply]);
    setComments((prev) => [...prev, parsed[0]]);
    setReplyText("");
    setReplyTo(null);
  };

  /* DELETE COMMENT */
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const target = comments.find((c) => c.commentId === deleteTarget);

    if (!target || target.user.userId !== user?.userId) {
      alert("Bạn không có quyền xóa bình luận này!");
      return;
    }

    await fetch(`/api/proxy/comments/${deleteTarget}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeader(),
      },
    });

    setComments((prev) => prev.filter((c) => c.commentId !== deleteTarget));
    setDeleteTarget(null);
  };

  /* UPDATE COMMENT */
  const confirmUpdate = async () => {
    if (!editTarget) return;
    if (!editText.trim()) return;

    if (editTarget.user.userId !== user?.userId) {
      alert("Bạn không thể sửa bình luận của người khác!");
      return;
    }

    await fetch(`/api/proxy/comments/${editTarget.commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ contents: editText }),
    });

    setComments((prev) =>
      prev.map((c) =>
        c.commentId === editTarget.commentId
          ? { ...c, content: editText }
          : c
      )
    );

    setEditTarget(null);
  };

  /* ================================
      UI
  ================================= */
  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-bold mb-6">
        Lời bình luận{" "}
        <span className="text-gray-500 text-base">({comments.length})</span>
      </h2>

      <div className="flex flex-col gap-8">
        {rootComments.map((c) => (
          <div key={`root-${c.commentId}`}>
            <CommentItem
              comment={c}
              onReplyClick={() =>
                setReplyTo(replyTo === c.commentId ? null : c.commentId)
              }
              onDelete={setDeleteTarget}
              onEdit={(comment: Comment) => {
                setEditTarget(comment);
                setEditText(comment.content);
              }}
            />

            {replyTo === c.commentId && (
              <div className="ml-14 mt-3">
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button
                  onClick={() => handleReplySubmit(c.commentId)}
                  className="bg-orange-500 text-white px-3 py-1 rounded-md mt-2"
                >
                  Reply
                </button>
              </div>
            )}

            {getReplies(c.commentId).map((r) => (
              <div key={`reply-${r.commentId}`} className="ml-12 mt-3">
                <CommentItem
                  comment={r}
                  isReply
                  onDelete={setDeleteTarget}
                  onEdit={(comment: Comment) => {
                    setEditTarget(comment);
                    setEditText(comment.content);
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* WRITE COMMENT */}
      <div className="mt-10 border-t pt-6">
        <h3 className="text-lg font-semibold mb-2">Viết Bình Luận</h3>

        <textarea
          className="w-full border rounded-md px-3 py-2"
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />

        <div className="text-right mt-3">
          <button
            onClick={handleNewComment}
            className="bg-orange-500 text-white px-5 py-2 rounded-md"
          >
            Nhận Xét
          </button>
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-xl font-bold text-center mb-3">
              Xóa bình luận?
            </h3>
            <p className="text-center text-gray-600 mb-4">
              Hành động này không thể hoàn tác.
            </p>

            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setDeleteTarget(null)}
              >
                Hủy
              </button>
              <button
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                onClick={confirmDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE MODAL */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-xl font-bold text-center mb-3">
              Chỉnh sửa bình luận
            </h3>

            <textarea
              className="w-full border rounded-md px-3 py-2 mb-4"
              rows={3}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setEditTarget(null)}
              >
                Hủy
              </button>

              <button
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                onClick={confirmUpdate}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
