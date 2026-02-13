import Image from "next/image";


export const Card = ({ source }: { source: string }) => {
  return (
    <div className="relative h-[80vh] w-[70vw] overflow-hidden">
      <Image
        src={source} // static Image source
        alt="Description"
        fill
      />
    </div>
  );
};
