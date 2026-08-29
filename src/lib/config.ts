/**
 * Glance Vision One — content & asset config.
 *
 * The hero is a cinematic video scrub (Apple-style): the glasses footage is
 * bound to scroll. Video lives in /public/video/glance-vision.mp4.
 */
export const VIDEO_URL = "/video/glance-vision.mp4";

export const HERO_BACKDROP =
  "https://images.pexels.com/photos/13026928/pexels-photo-13026928.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop";
export const SPECS_BACKDROP =
  "https://images.pexels.com/photos/12537426/pexels-photo-12537426.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop";

export const PRODUCT = {
  brand: "Glance Vision",
  name: "Glance Vision One",
  price: "$1,499",
  tagline: "Look classic. Think beyond.",
};

export const SPECS = {
  camera: "12 MP",
  chip: "Neural Engine",
  weight: "45 g",
  display: "4K Micro-OLED",
  battery: "18 hr",
};

/* Nav links map to real section <id>s so anchors smooth-scroll properly. */
export const NAV_LINKS = [
  { label: "Overview", href: "#overview" },
  { label: "Experience", href: "#experience" },
  { label: "Specs", href: "#specs" },
  { label: "Design", href: "#design" },
] as const;
