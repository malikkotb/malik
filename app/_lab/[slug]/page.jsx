import { client } from "../../sanity/client";
import Link from "next/link";
import TransitionLink from "@/components/TransitionLink";

const LAB_QUERY = `*[_type == "lab" && slug.current == $slug][0]{
    _id,
    _createdAt,
    _updatedAt,
    title,
    slug,
    description,
    videoSources,
}`;

    const options = { next: { revalidate: 3600 } }; 

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await client.fetch(LAB_QUERY, { slug: slug }, options);

  if (!post) {
    return (
      <main className='container mx-auto h-full max-w-3xl p-8 flex flex-col gap-4'>
        <TransitionLink href='/lab' className='hover:underline'>
          ← Back to Lab
        </TransitionLink>
        <h1 className='text-4xl font-bold mb-8'>Post not found</h1>
      </main>
    );
  }

  console.log(post);

  return (
    <main className='container mx-auto h-full max-w-3xl p-8 flex flex-col gap-4' data-transition-content>
      <Link href='/lab' className='hover:underline'>
        ← Back to Lab
      </Link>
      <h1 className='text-4xl font-bold mb-4'>{post.title}</h1>
      {post.description && (
        <p className='text-lg text-gray-700 mb-6'>{post.description}</p>
      )}
      {post._createdAt && (
        <p className='text-sm text-gray-500 mb-6'>
          Created: {new Date(post._createdAt).toLocaleDateString()}
        </p>
      )}
      {Array.isArray(post.videoSources) && post.videoSources.length > 0 && (
        <div className='space-y-4'>
          {post.videoSources.map((videoSrc, index) => (
            <video
              key={index}
              src={videoSrc}
              controls
              className='w-full rounded-xl'
              autoPlay
              loop
              muted
            />
          ))}
        </div>
      )}
    </main>
  );
}
