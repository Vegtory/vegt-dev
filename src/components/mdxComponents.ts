import MdxCustomPicture from "./MdxCustomPicture.astro";

/**
 * Components available inside MDX bodies. Pass to `<Content components={...} />`
 * when rendering a collection entry:
 *
 *   <MdxCustomPicture image="/../src/assets/foo.png" description="..." />
 *
 * Note these take `image`/`description`, not the `src`/`alt` that a plain
 * markdown `![]()` would pass, so `img` is deliberately not remapped here.
 */
export const mdxComponents = {
  MdxCustomPicture,
};

export default mdxComponents;
