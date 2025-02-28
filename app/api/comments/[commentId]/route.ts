import Comment from "@/database/comment.model";
import Post from "@/database/post.model";
import User from "@/database/user.model";
import { connectToDatabase } from "@/lib/mognoose";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  route: { params: { commentId: string } }
) {
  try {
    await connectToDatabase();
    const { commentId } = route.params;
    const { postId } = await req.json();

    await Comment.findByIdAndDelete(commentId);
    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: commentId },
    });
    
    return NextResponse.json({ message: "Comment deleted" });
  } catch (error) {
    const result = error as Error;
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
}
