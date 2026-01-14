import ProjectCarousel from "@/components/ProjectCarousel/ProjectCarousel";
import projects from "@/app/carouselData";
import WebGLCarousel from "@/components/WebGLCarousel/WebGLCarousel";
export default function IndexClient() {
  return (
    <div className='h-full w-full'>
      <div className="hidden lg:block">
        <WebGLCarousel />
      </div>
      {/* <div className="text-center h-[30vh] flex items-center justify-center uppercase">
        Creative Web Development
      </div> */}
      <div className="lg:hidden">
        <div className="flex flex-col gap-4" style={{ paddingTop: "30vh" }}>
          {projects.map((project) => {
            const aspectClass = project.orientation === "vertical" 
              ? "aspect-[4/5]" 
              : "aspect-video";
            
            return (
              <div
                key={project.title}
                // href={project.link}
                className={`relative overflow-hidden ${aspectClass} w-full`}
                style={{ textDecoration: "none" }}
              >
              {project.videoSrc && (
                <video
                  src={project.videoSrc}
                  className='w-full h-full object-cover'
                  loop
                  muted
                  playsInline
                  // autoPlay
                  preload='auto'
                />
              )}

              {/* Title - Bottom Left */}
              <div
                style={{
                  position: "absolute",
                  bottom: "14px",
                  left: "14px",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 500,
                  pointerEvents: "none",
                }}
              >
                {project.title}
              </div>

              {/* Link - Bottom Right */}
              <div
                style={{
                  position: "absolute",
                  bottom: "14px",
                  right: "14px",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 500,
                  pointerEvents: "none",
                }}
              >
                {project.link
                  ?.replace(/^https?:\/\/(www\.)?/i, "")
                  .replace(/\/$/, "")}
              </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
