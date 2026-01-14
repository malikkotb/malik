import LabClient from "./LabClient";
import { client } from "../sanity/client";

const LAB_QUERY = `*[
    _type == "lab"
    && defined(slug.current)
  ]|order(published desc)[0...12]{_id, title, slug, published, videoSources}`;

const options = { next: { revalidate: 3600 } };
export default async function Lab() {
  const labPosts = await client.fetch(LAB_QUERY, options);
  console.log(labPosts);
  return <LabClient labPosts={labPosts} />;
}
