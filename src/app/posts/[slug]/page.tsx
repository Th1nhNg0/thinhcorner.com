import { allPosts } from "contentlayer/generated";
import { notFound } from "next/navigation";
import PostView from "./PostView";

export const generateStaticParams = async () =>
  allPosts.map((post) => ({ slug: post._raw.flattenedPath }));

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    openGraph: {
      title: post.title,
    },
  };
};

const PostLayout = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug);
  if (!post) notFound();

  return <PostView post={post} />;
};

export default PostLayout;
