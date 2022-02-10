import Image from "next/image";

const myLoader = ({ src, width, quality }) => {
  return `${src}?width=${width}`
}

export default function LocalImage({loader, ...props}) {
  //TODO: webp
  return (<Image loader={myLoader}
    // placeholder="blur"
    // blurDataURL={`data:image/jpeg;charset=utf-8;base64,${toBase64(props.src)}`}
    {...props}/>);
}