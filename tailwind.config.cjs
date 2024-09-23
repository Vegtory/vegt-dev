import templateConfig from "#template-root/tailwind.config.cjs";

templateConfig.theme = {
  // fontFamily: {
  //   'sans': ['ui-sans-serif', 'system-ui', ...],
  //   'serif': ['ui-serif', 'Georgia', ...],
  //   'mono': ['ui-monospace', 'SFMono-Regular', ...],
  //   'display': ['Oswald', ...],
  //   'body': ['"Open Sans"', ...],
  // },
  extend: {
    ...templateConfig.theme.extend,
    colors: {
      ...templateConfig.theme.extend.colors,
      secondary: {
        50: "#F4F4F6",
        100: "#E8E9EC",
        200: "#C6C9D0",
        300: "#A4A8B3",
        400: "#60667A",
        500: "#1C2541",
        600: "#19213B",
        700: "#111627",
        800: "#0D111D",
        900: "#080B14",
      },
      primary: {
        50: "#F5F6F8",
        100: "#EBEEF0",
        200: "#CED3DA",
        300: "#B0B9C4",
        400: "#758597",
        500: "#3A506B",
        600: "#344860",
        700: "#233040",
        800: "#1A2430",
        900: "#111820",
      },
      accent: {
        50: "#F7FCFC",
        100: "#EFF9F9",
        200: "#D6EFEF",
        300: "#BDE6E5",
        400: "#8CD3D2",
        500: "#5BC0BE",
        600: "#52ADAB",
        700: "#377372",
        800: "#295656",
        900: "#1B3A39",
      },
      background: {
        50: "#FFF",
        100: "#FFF",
        200: "#FFF",
        300: "#FFF",
        400: "#FFF",
        500: "#FF",
        600: "#FFF",
        700: "#FFF",
        800: "#FFF",
        900: "#FFF",
      },
      background: "#FFF",
      blackText: "#000",
      whiteText: "#FFF",
      primaryText: "#233040",
      secondaryText: "#111627",
      accentText: "#5BC0BE",
    },
  },
};

/** @type {import('tailwindcss').Config} */
module.exports = templateConfig;
