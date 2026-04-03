"use client";

import { Fragment, useState } from "react";

type CommunityRole = "ADMIN" | "CREATOR" | "STUDENT";

type CommunityComment = {
  id: string;
  parentId: string | null;
  authorUserId: string | null;
  authorName: string;
  authorRole: CommunityRole;
  body: string;
  createdAt: string;
  likesCount: number;
  viewerHasLiked: boolean;
  replies: CommunityComment[];
};

type CommunityMessage = {
  id: string;
  authorUserId: string | null;
  authorName: string;
  authorRole: CommunityRole;
  body: string;
  createdAt: string;
  likesCount: number;
  viewerHasLiked: boolean;
  comments: CommunityComment[];
};

type CommunityMember = {
  id: string;
  name: string | null;
  email: string;
  joinedAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function roleLabel(role: CommunityRole) {
  if (role === "CREATOR") return "Host";
  if (role === "ADMIN") return "Admin";
  return "Student";
}

function renderRichText(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (!part) return null;
    const isUrl = /^(https?:\/\/|www\.)/i.test(part);
    if (!isUrl) {
      return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
    }
    const href = /^https?:\/\//i.test(part) ? part : `https://${part}`;
    return (
      <a
        key={`${href}-${index}`}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="break-all text-cyan-300 underline decoration-cyan-400/50 underline-offset-4 hover:text-cyan-200"
      >
        {part}
      </a>
    );
  });
}

function updateCommentTree(
  comments: CommunityComment[] = [],
  commentId: string,
  updater: (comment: CommunityComment) => CommunityComment
): CommunityComment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return updater(comment);
    }

    if ((comment.replies?.length ?? 0) > 0) {
      return {
        ...comment,
        replies: updateCommentTree(comment.replies ?? [], commentId, updater),
      };
    }

    return comment;
  });
}

function countAllComments(comments?: CommunityComment[]): number {
  if (!comments || comments.length === 0) return 0;

  return comments.reduce((total, comment) => total + 1 + countAllComments(comment.replies ?? []), 0);
}

export function CourseCommunity({
  slug,
  title,
  description,
  accessToken,
  canPost,
  currentUserId,
  members,
  initialMessages,
}: {
  slug: string;
  title: string;
  description: string;
  accessToken?: string;
  canPost: boolean;
  currentUserId: string;
  members: CommunityMember[];
  initialMessages: CommunityMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestMembers = members.slice(0, 5);
  const featuredMessage = messages[messages.length - 1] ?? null;

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!canPost) return;
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/community/${slug}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body,
        accessToken,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: Omit<CommunityMessage, "likesCount" | "viewerHasLiked" | "comments">;
    };
    setLoading(false);
    if (!res.ok || !data.message) {
      setError(data.error || "Could not send message");
      return;
    }
    setMessages((current) => [
      ...current,
      {
        ...data.message!,
        likesCount: 0,
        viewerHasLiked: false,
        comments: [],
      },
    ]);
    setBody("");
  }

  async function toggleLike(targetType: "message" | "comment", targetId: string) {
    const res = await fetch(`/api/community/${slug}/likes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken,
        targetType,
        targetId,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; liked?: boolean; likesCount?: number };
    if (!res.ok || typeof data.liked !== "boolean" || typeof data.likesCount !== "number") {
      return;
    }

    setMessages((current) =>
      current.map((message) => {
        if (targetType === "message" && message.id === targetId) {
          return {
            ...message,
            viewerHasLiked: data.liked!,
            likesCount: data.likesCount!,
          };
        }

        return {
          ...message,
          comments: updateCommentTree(message.comments, targetId, (comment) => ({
            ...comment,
            viewerHasLiked: data.liked!,
            likesCount: data.likesCount!,
          })),
        };
      })
    );
  }

  async function createComment(messageId: string, body: string, parentCommentId?: string) {
    const res = await fetch(`/api/community/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken,
        messageId,
        parentCommentId,
        body,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      comment?: Omit<CommunityComment, "likesCount" | "viewerHasLiked" | "replies">;
    };
    if (!res.ok || !data.comment) {
      return data.error || "Could not create comment";
    }

    const nextComment: CommunityComment = {
      ...data.comment,
      likesCount: 0,
      viewerHasLiked: false,
      replies: [],
    };

    setMessages((current) =>
      current.map((message) => {
        if (message.id !== messageId) return message;

        if (!parentCommentId) {
          return {
            ...message,
            comments: [...message.comments, nextComment],
          };
        }

        return {
          ...message,
          comments: updateCommentTree(message.comments, parentCommentId, (comment) => ({
            ...comment,
            replies: [...comment.replies, nextComment],
          })),
        };
      })
    );

    return null;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,31,0.96)_0%,rgba(5,9,22,0.98)_100%)] shadow-[0_35px_120px_rgba(2,6,23,0.55)] sm:rounded-[36px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(217,70,239,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(96,165,250,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="relative p-4 sm:p-6 lg:p-7">
          <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#06b6d4)] text-sm font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.35)]">
                    {getInitials(title || slug)}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Course Community</p>
                    <p className="mt-1 text-sm text-slate-500">Private member network</p>
                  </div>
                </div>
                <h1 className="mt-5 text-3xl font-semibold tracking-[0.03em] text-white sm:text-4xl">{title}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">{description || "Private student community channel."}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:w-fit sm:grid-cols-3">
                <div className="rounded-2xl border border-cyan-300/18 bg-cyan-300/8 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/70">Room</p>
                  <p className="mt-2 text-sm font-semibold text-white">#general</p>
                </div>
                <div className="rounded-2xl border border-fuchsia-300/18 bg-fuchsia-300/8 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-fuchsia-200/70">Members</p>
                  <p className="mt-2 text-sm font-semibold text-white">{members.length}</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-emerald-300/18 bg-emerald-300/8 px-4 py-3 sm:col-span-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-200/70">Posting</p>
                  <p className="mt-2 text-sm font-semibold text-white">{canPost ? "Creator/Admin" : "Comments only"}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_50px_rgba(2,6,23,0.26),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Create post</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {canPost
                        ? "Share updates, schedules, and guidance with your students."
                        : "Only the creator or an admin can publish posts. You can still like, comment, and reply below."}
                    </p>
                  </div>
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-100">
                    Live channel
                  </div>
                </div>

                <form onSubmit={sendMessage} className="mt-4 space-y-4">
                  {error && (
                    <p className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="rounded-[24px] border border-white/8 bg-slate-950/45 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={4}
                      disabled={!canPost}
                      placeholder={canPost ? "What update do you want to share with students?" : "Posting is reserved for the creator or admins."}
                      className="min-h-28 w-full resize-none bg-transparent text-sm leading-6 text-slate-200 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:text-slate-500"
                    />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                      <span className="rounded-full border border-white/8 px-3 py-2">Image</span>
                      <span className="rounded-full border border-white/8 px-3 py-2">Video</span>
                      <span className="rounded-full border border-white/8 px-3 py-2">Resources</span>
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !body.trim() || !canPost}
                      className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#06b6d4)] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.25)] disabled:opacity-60"
                    >
                      {loading ? "Publishing..." : "Publish"}
                    </button>
                  </div>
                </form>
              </section>

              <section className="space-y-4">
                {messages.length === 0 ? (
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-400 shadow-[0_20px_50px_rgba(2,6,23,0.26)]">
                    No posts yet. Start the conversation.
                  </div>
                ) : (
                  messages
                    .slice()
                    .reverse()
                    .map((message) => (
                      <article
                        key={message.id}
                        className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_50px_rgba(2,6,23,0.26),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f472b6,#fb7185)] text-sm font-semibold text-white">
                              {getInitials(message.authorName)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">{message.authorName}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {formatDate(message.createdAt)} · {roleLabel(message.authorRole)}
                                {message.authorUserId === currentUserId ? " · you" : ""}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-[22px] border border-white/8 bg-slate-950/40 px-4 py-4">
                          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{renderRichText(message.body)}</p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.16em] text-slate-500 sm:gap-5">
                          <button
                            type="button"
                            onClick={() => toggleLike("message", message.id)}
                            className={message.viewerHasLiked ? "text-cyan-300" : ""}
                          >
                            {message.likesCount} likes
                          </button>
                          <span>{countAllComments(message.comments)} comments</span>
                        </div>

                        <div className="mt-5">
                          <CommentComposer
                            placeholder="Write a comment..."
                            submitLabel="Comment"
                            onSubmit={(commentBody) => createComment(message.id, commentBody)}
                          />
                        </div>

                        <div className="mt-5 space-y-4">
                          {message.comments.map((comment) => (
                            <CommentThread
                              key={comment.id}
                              messageId={message.id}
                              comment={comment}
                              depth={0}
                              onLike={toggleLike}
                              onReply={createComment}
                            />
                          ))}
                        </div>
                      </article>
                    ))
                )}
              </section>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_50px_rgba(2,6,23,0.26),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Members</h2>
                  <p className="text-xs text-slate-500">{members.length} total</p>
                </div>
                <div className="mt-4 space-y-3">
                  {members.length === 0 ? (
                    <p className="text-sm text-slate-500">No members yet.</p>
                  ) : (
                    members.slice(0, 6).map((member) => (
                      <div key={member.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/35 px-3 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#60a5fa,#c084fc)] text-xs font-semibold text-white">
                          {getInitials(member.name || member.email)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-100">{member.name || member.email}</p>
                          <p className="truncate text-xs text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {latestMembers.length > 0 ? (
                  <div className="mt-5 flex items-center gap-2">
                    {latestMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-950 bg-[linear-gradient(135deg,#fb7185,#f59e0b)] text-[10px] font-semibold text-white"
                        title={member.name || member.email}
                      >
                        {getInitials(member.name || member.email)}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_50px_rgba(2,6,23,0.26),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
                <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-fuchsia-200">Latest pulse</h2>
                <div className="mt-4 rounded-[22px] border border-white/8 bg-slate-950/38 p-4">
                  {featuredMessage ? (
                    <>
                      <p className="text-sm font-semibold text-white">{featuredMessage.authorName}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{renderRichText(featuredMessage.body)}</p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">No activity yet.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentComposer({
  placeholder,
  submitLabel,
  onSubmit,
}: {
  placeholder: string;
  submitLabel: string;
  onSubmit: (body: string) => Promise<string | null | undefined>;
}) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const result = await onSubmit(body);
        setLoading(false);
        if (result) {
          setError(result);
          return;
        }
        setBody("");
      }}
    >
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <div className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent text-sm leading-6 text-slate-200 outline-none placeholder:text-slate-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !body.trim()}
        className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 disabled:opacity-60"
      >
        {loading ? "Sending..." : submitLabel}
      </button>
    </form>
  );
}

function CommentThread({
  messageId,
  comment,
  depth,
  onLike,
  onReply,
}: {
  messageId: string;
  comment: CommunityComment;
  depth: number;
  onLike: (targetType: "message" | "comment", targetId: string) => Promise<void>;
  onReply: (messageId: string, body: string, parentCommentId?: string) => Promise<string | null | undefined>;
}) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div className={`${depth > 0 ? "ml-4 border-l border-white/8 pl-4 sm:ml-6 sm:pl-5" : ""}`}>
      <div className="rounded-[20px] border border-white/8 bg-slate-950/30 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#818cf8,#22d3ee)] text-[11px] font-semibold text-white">
            {getInitials(comment.authorName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-100">{comment.authorName}</p>
            <p className="mt-1 text-xs text-slate-500">
              {formatDate(comment.createdAt)} · {roleLabel(comment.authorRole)}
            </p>
            <div className="mt-3 text-sm leading-6 text-slate-300">{renderRichText(comment.body)}</div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.16em] text-slate-500">
              <button
                type="button"
                onClick={() => onLike("comment", comment.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] transition ${
                  comment.viewerHasLiked
                    ? "border-amber-300/35 bg-amber-300/12 text-amber-200"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-amber-300/20 hover:text-amber-200"
                }`}
                aria-pressed={comment.viewerHasLiked}
              >
                <span aria-hidden="true">{comment.viewerHasLiked ? "😍" : "🤍"}</span>
                <span>{comment.likesCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReply((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-slate-400 transition hover:border-cyan-300/20 hover:text-cyan-200"
              >
                <span aria-hidden="true">↩</span>
                reply
              </button>
            </div>
          </div>
        </div>

        {showReply ? (
          <div className="mt-4">
            <CommentComposer
              placeholder="Write a reply..."
              submitLabel="Reply"
              onSubmit={async (body) => {
                const result = await onReply(messageId, body, comment.id);
                if (!result) setShowReply(false);
                return result;
              }}
            />
          </div>
        ) : null}
      </div>

      {(comment.replies?.length ?? 0) > 0 ? (
        <div className="mt-3 space-y-3">
          {(comment.replies ?? []).map((reply) => (
            <CommentThread
              key={reply.id}
              messageId={messageId}
              comment={reply}
              depth={depth + 1}
              onLike={onLike}
              onReply={onReply}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
