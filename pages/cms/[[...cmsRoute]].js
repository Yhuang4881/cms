import Head from "next/head";
import Cms from "../../cms/cms.js";
import Home from "../index.tsx";
import Post from "../posts/[id].tsx";

export default function CmsIndex(props) {
  return (
    <Cms owner="youshaneh" repo="cms">
      {/* only cms page components go here */}
      <Home />
      <Post />
    </Cms>
  )
}