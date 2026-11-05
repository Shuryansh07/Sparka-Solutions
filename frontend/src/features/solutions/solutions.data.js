import { BatteryCharging, Boxes, Camera, Lightbulb, MapPinned, ShieldCheck, Sparkles, Wrench } from 'lucide-react';

export const SOLUTION_CATEGORIES = [
  {
    icon: Camera,
    title: 'Safety, Cameras & Vision',
    text: 'Dash cameras, backup systems, visibility, driver assistance, and safety equipment.',
    examples: ['Forward & driver-facing cameras', 'Backup & blind-spot systems', 'Collision & driver assistance'],
  },
  {
    icon: MapPinned,
    title: 'GPS, Telematics & Connectivity',
    text: 'Tracking, fleet data, communications, and connected-vehicle solutions.',
    examples: ['Vehicle & asset tracking', 'Fleet data & reporting', 'In-vehicle connectivity'],
  },
  {
    icon: Lightbulb,
    title: 'Lighting & Electrical',
    text: 'Warning lights, work lighting, wiring, charging, power management, and accessories.',
    examples: ['Warning & beacon lighting', 'Work & scene lighting', 'Wiring & power distribution'],
  },
  {
    icon: Boxes,
    title: 'Racks, Storage & Upfitting',
    text: 'Shelving, partitions, tool storage, racks, cargo organization, and vehicle outfitting.',
    examples: ['Shelving & partitions', 'Ladder & cargo racks', 'Complete van build-outs'],
  },
  {
    icon: BatteryCharging,
    title: 'Power & Specialty Systems',
    text: 'Inverters, batteries, auxiliary power, and application-specific equipment.',
    examples: ['Inverters & auxiliary batteries', 'Charging solutions', 'Application-specific equipment'],
  },
  {
    icon: ShieldCheck,
    title: 'Security & Asset Protection',
    text: 'Vehicle security, alarms, asset monitoring, and theft-deterrent options.',
    examples: ['Alarms & immobilizers', 'Locks & access control', 'Asset monitoring'],
  },
  {
    icon: Wrench,
    title: 'Installation & Integration',
    text: 'Project planning, compatible components, coordinated installation, and verification.',
    examples: ['Compatibility planning', 'Coordinated installation', 'Quality verification'],
  },
  {
    icon: Sparkles,
    title: 'And Much More',
    text: "Have something unusual in mind? Tell us what you're trying to accomplish. We'll explore sourcing options.",
    examples: ['Specialty & hard-to-find items', 'Multi-vendor projects', 'Supplies & accessories'],
    highlight: true,
  },
];
