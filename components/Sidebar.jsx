import HoverListSidebar from "./HoverList/HoverListSidebar";

export default function Sidebar({ posts, type = "blog" }) {
  const basePath = type === "blog" ? "/blog" : "/lab";

  return (
    <div className='h-screen pt-[40px] w-[25vw] absolute left-0 top-0 overflow-y-auto'>
      <div className='p-5'>
        <h2 className='mb-4 uppercase'>
          {type === "blog" ? "Blog" : "Lab"}
        </h2>
        <HoverListSidebar posts={posts} basePath={basePath} />
      </div>
    </div>
  );
}
