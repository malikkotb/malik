import IndexClient from "./IndexClient";
import LoadingScreen from "@/components/LoadingScreen";
export default async function Home() {
  return (
    <>
      <LoadingScreen />
      <IndexClient />
    </>
  );
}
