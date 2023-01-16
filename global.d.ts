declare module '*.yml' {
  // eslint-disable-next-line
  const data: any;
  export default data;
}

declare module '*.html' {
  const content: string;
  export default content;
}
