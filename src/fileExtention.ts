/** [How to import SVG file with Webpack + Typescript]
 * @link https://stackoverflow.com/questions/44717164/unable-to-import-svg-files-in-typescript
 */

declare module '*.svg' {
    const content: any;
    // const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
  }
  
  declare module '*.png' {
    const value: any;
    export default value;
  }
  
  declare module '*.obj' {
    const value: any;
    export default value;
  }
  
  declare module '*.glb' {
    const value: any;
    export default value;
  }
  
  
  declare module '*.gltf' {
    const value: any;
    export default value;
  }