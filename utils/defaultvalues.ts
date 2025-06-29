type VideoTransformation = {
  width: number;
  height: number;
  quality?: number;
}; // first declare the type


export const default_transformation ={
    width:1080,
    height:1920
}as const


export default VideoTransformation


