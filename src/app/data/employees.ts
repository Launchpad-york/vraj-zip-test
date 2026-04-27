export type Availability = 'all' | 'bench' | 'partial' | 'ending-soon' | 'utilized';

export interface Employee {
  id: string;
  name: string;
  title: string;
  initials: string;
  avatarColor: string;
  skills: string[];
  extraSkills: number;
  reportingTo: string;
  reportingInitials: string;
  reportingColor: string;
  squad: string;
  squadColor?: string;
  guild: string;
  experience: string;
  availability: Exclude<Availability, 'all'>;
}

export const EMPLOYEES: Employee[] = [
  {
    id: 'YI332',
    name: 'Shreya Gokani',
    title: 'Senior Project Manager',
    initials: 'SG',
    avatarColor: '#F59E0B',
    skills: ['jQuery', 'Agile Methodology', 'ERP Systems'],
    extraSkills: 15,
    reportingTo: 'Kalrav Parsana',
    reportingInitials: 'KP',
    reportingColor: '#6366F1',
    squad: 'York',
    squadColor: '#10B981',
    guild: '-',
    experience: '9Yr 1Mo',
    availability: 'utilized',
  },
  {
    id: 'YI331',
    name: 'Jenish Gohil',
    title: 'Finance Advisory Specialist',
    initials: 'JG',
    avatarColor: '#EC4899',
    skills: ['Balance Sheet Review', 'QuickBooks', 'Month-End Close'],
    extraSkills: 2,
    reportingTo: 'Bhaumik Shah',
    reportingInitials: 'BS',
    reportingColor: '#8B5CF6',
    squad: 'Impact Makers',
    squadColor: '#10B981',
    guild: '-',
    experience: '-',
    availability: 'bench',
  },
  {
    id: 'YINH17',
    name: 'Bryan Belanger',
    title: 'Senior Director of Sales & RevOps',
    initials: 'BB',
    avatarColor: '#4FD1C5',
    skills: ['Revenue Operations', 'Pipeline & Forecasting Analysis', 'Salesforce CRM Specialist'],
    extraSkills: 4,
    reportingTo: 'Kyle York',
    reportingInitials: 'KY',
    reportingColor: '#F59E0B',
    squad: '-',
    guild: '-',
    experience: '-',
    availability: 'partial',
  },
  {
    id: 'YI329',
    name: 'Bhumika Udani',
    title: 'Senior Salesforce Architect',
    initials: 'BU',
    avatarColor: '#9F7AEA',
    skills: ['Salesforce CRM Specialist'],
    extraSkills: 0,
    reportingTo: 'Mohit Surani',
    reportingInitials: 'MS',
    reportingColor: '#48BB78',
    squad: 'Trailblazers',
    squadColor: '#10B981',
    guild: '-',
    experience: '-',
    availability: 'ending-soon',
  },
  {
    id: 'YI328',
    name: 'Jiyanshi Patel',
    title: 'UX Designer',
    initials: 'JP',
    avatarColor: '#F472B6',
    skills: ['UI/UX', 'Wireframes', 'Information Architecture'],
    extraSkills: 2,
    reportingTo: 'Sagar Harsora',
    reportingInitials: 'SH',
    reportingColor: '#6366F1',
    squad: 'Tech Excellence',
    squadColor: '#10B981',
    guild: '-',
    experience: '-',
    availability: 'bench',
  },
];
