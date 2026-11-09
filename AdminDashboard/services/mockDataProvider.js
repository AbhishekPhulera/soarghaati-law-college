/**
 * ==============================================================================
 * MOCK DATA PROVIDER — Soarghaati Law College Admission Management System
 * ==============================================================================
 * 
 * ARCHITECTURAL NOTICE:
 * This module is strictly an isolated development mock provider.
 * In production, all lead records, student enquiries, notes, and activity history
 * will be retrieved from PostgreSQL via Supabase with Row Level Security (RLS)
 * and server-enforced authorization policies.
 * 
 * NO sensitive or real student records are stored in this mock file.
 * All records below are simulated test data adhering to Uttarakhand higher education
 * enquiry patterns (Pithoragarh, Kumaon region, SSJ University affiliation).
 * ==============================================================================
 */

const STORAGE_KEY = 'slc_admission_leads_v1';
const RESET_TIMESTAMP_KEY = 'slc_leads_last_reset';

export const INITIAL_MOCK_LEADS = [
  {
    id: 'SLC-2026-001',
    name: 'Aarav Joshi',
    email: 'aarav.joshi26@gmail.com',
    mobile: '9837124589',
    altMobile: '9412089456',
    course: 'B.A. LL.B (5-Year Integrated)',
    city: 'Pithoragarh',
    state: 'Uttarakhand',
    academicScore: '86.4% in Class XII (CBSE)',
    category: 'General',
    createdAt: '2026-10-29T10:15:00Z',
    status: 'New',
    followUpDate: '2026-11-02',
    message: 'I have completed Class 12 Humanities with 86.4%. Very keen on legal aid and civil law. Requesting prospectus, fee structure for B.A. LL.B 5-Year course, and hostel availability for local candidates.',
    notes: [
      { id: 'note-1', author: 'System', text: 'Lead received via college website admission portal.', createdAt: '2026-10-29T10:15:00Z' }
    ],
    history: [
      { timestamp: '2026-10-29T10:15:00Z', action: 'Lead Created', details: 'Web enquiry submitted for B.A. LL.B', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-002',
    name: 'Priya Rawat',
    email: 'priya.rawat.law@outlook.com',
    mobile: '9758412365',
    altMobile: '8954120398',
    course: 'LL.B (3-Year Degree)',
    city: 'Dehradun',
    state: 'Uttarakhand',
    academicScore: '74.2% in B.A. Political Science (HNBGU)',
    category: 'General',
    createdAt: '2026-10-28T14:30:00Z',
    status: 'Contacted',
    followUpDate: '2026-11-01',
    message: 'Graduated in B.A. Political Science in 2025. Seeking admission to 3-Year LL.B. Need details on court visits, moot court training, and class timings.',
    notes: [
      { id: 'note-1', author: 'Admissions Desk', text: 'Spoke with candidate over phone. She is willing to relocate to Pithoragarh. Sent course brochure and fee breakdown via WhatsApp.', createdAt: '2026-10-28T16:10:00Z' }
    ],
    history: [
      { timestamp: '2026-10-28T14:30:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' },
      { timestamp: '2026-10-28T16:10:00Z', action: 'Status Changed', details: 'Changed from New to Contacted', performedBy: 'Admissions Desk' }
    ]
  },
  {
    id: 'SLC-2026-003',
    name: 'Rohan Bhatt',
    email: 'rohan.bhatt.adv@gmail.com',
    mobile: '9411587421',
    altMobile: '',
    course: 'LL.M (2-Year Master of Laws)',
    city: 'Almora',
    state: 'Uttarakhand',
    academicScore: '68.5% in LL.B (SSJU Almora)',
    category: 'General',
    createdAt: '2026-10-27T09:45:00Z',
    status: 'Follow-up Required',
    followUpDate: '2026-10-31',
    message: 'Completed LL.B from SSJU. Interested in Constitutional Law specialization in LL.M. Does college offer weekend or flexible research seminars?',
    notes: [
      { id: 'note-1', author: 'Counselor Sharma', text: 'Candidate is preparing for judicial services exam. Wants curriculum details for LL.M Constitutional Law branch.', createdAt: '2026-10-27T11:20:00Z' },
      { id: 'note-2', author: 'Counselor Sharma', text: 'Follow-up scheduled for 31st Oct to confirm document verification appointment.', createdAt: '2026-10-28T10:00:00Z' }
    ],
    history: [
      { timestamp: '2026-10-27T09:45:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' },
      { timestamp: '2026-10-27T11:20:00Z', action: 'Status Changed', details: 'Changed from New to Follow-up Required', performedBy: 'Counselor Sharma' }
    ]
  },
  {
    id: 'SLC-2026-004',
    name: 'Ananya Bisht',
    email: 'ananya.bisht.pith@gmail.com',
    mobile: '9634852147',
    altMobile: '9837001122',
    course: 'B.A. LL.B (5-Year Integrated)',
    city: 'Pithoragarh',
    state: 'Uttarakhand',
    academicScore: '91.2% in Class XII (Uttarakhand Board)',
    category: 'OBC',
    createdAt: '2026-10-26T11:00:00Z',
    status: 'Admission Completed',
    followUpDate: null,
    message: 'Pithoragarh native with 91.2% in 12th. Applying for direct merit admission under state quota. All certificates ready.',
    notes: [
      { id: 'note-1', author: 'Principal Office', text: 'Document verification completed. Seat allocated under Merit Quota.', createdAt: '2026-10-27T15:00:00Z' },
      { id: 'note-2', author: 'Accounts Desk', text: 'First semester tuition fee received via NEFT (Ref: UTIB0002819). Roll number allocated: SLC26BALLB014.', createdAt: '2026-10-28T12:30:00Z' }
    ],
    history: [
      { timestamp: '2026-10-26T11:00:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' },
      { timestamp: '2026-10-27T15:00:00Z', action: 'Status Changed', details: 'Changed to Interested', performedBy: 'Principal Office' },
      { timestamp: '2026-10-28T12:30:00Z', action: 'Status Changed', details: 'Admission Completed — Fees Verified', performedBy: 'Accounts Desk' }
    ]
  },
  {
    id: 'SLC-2026-005',
    name: 'Vikramaditya Pant',
    email: 'vikram.pant.hld@yahoo.com',
    mobile: '8979564123',
    altMobile: '',
    course: 'LL.B (3-Year Degree)',
    city: 'Haldwani',
    state: 'Uttarakhand',
    academicScore: '65.8% in B.Com (Kumaun Univ)',
    category: 'General',
    createdAt: '2026-10-25T16:20:00Z',
    status: 'Interested',
    followUpDate: '2026-11-03',
    message: 'Working in Haldwani, seeking evening / weekend classes for 3-Year LL.B. BCI attendance criteria inquiry.',
    notes: [
      { id: 'note-1', author: 'Counselor Verma', text: 'Clarified BCI strict 75% mandatory attendance guideline. Candidate agreed to attend regular lectures in Pithoragarh campus.', createdAt: '2026-10-26T10:15:00Z' }
    ],
    history: [
      { timestamp: '2026-10-25T16:20:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' },
      { timestamp: '2026-10-26T10:15:00Z', action: 'Status Changed', details: 'Changed to Interested', performedBy: 'Counselor Verma' }
    ]
  },
  {
    id: 'SLC-2026-006',
    name: 'Sneha Upadhyay',
    email: 'sneha.upadhyay.law@gmail.com',
    mobile: '9456789123',
    altMobile: '9456789124',
    course: 'B.A. LL.B (5-Year Integrated)',
    city: 'Champawat',
    state: 'Uttarakhand',
    academicScore: '82.5% in Class XII',
    category: 'General',
    createdAt: '2026-10-24T12:00:00Z',
    status: 'New',
    followUpDate: '2026-11-01',
    message: 'Looking for girls hostel accommodation safety, Wi-Fi facilities, and campus transport from Tanakpur/Champawat.',
    notes: [],
    history: [
      { timestamp: '2026-10-24T12:00:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-007',
    name: 'Harish Bora',
    email: 'harish.bora.adv@rediffmail.com',
    mobile: '7895412360',
    altMobile: '',
    course: 'LL.M (2-Year Master of Laws)',
    city: 'Nainital',
    state: 'Uttarakhand',
    academicScore: '71.0% in LL.B',
    category: 'General',
    createdAt: '2026-10-23T15:10:00Z',
    status: 'Contacted',
    followUpDate: '2026-11-04',
    message: 'Practicing advocate at District Court Nainital. Interested in Criminal Law specialization for LL.M.',
    notes: [
      { id: 'note-1', author: 'Dean Office', text: 'Sent syllabus for Criminal Law & Criminology specialization.', createdAt: '2026-10-24T11:00:00Z' }
    ],
    history: [
      { timestamp: '2026-10-23T15:10:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' },
      { timestamp: '2026-10-24T11:00:00Z', action: 'Status Changed', details: 'Changed to Contacted', performedBy: 'Dean Office' }
    ]
  },
  {
    id: 'SLC-2026-008',
    name: 'Kavya Pandey',
    email: 'kavya.pandey2004@gmail.com',
    mobile: '9149876543',
    altMobile: '9412033445',
    course: 'B.A. LL.B (5-Year Integrated)',
    city: 'Bageshwar',
    state: 'Uttarakhand',
    academicScore: '79.6% in Class XII',
    category: 'EWS',
    createdAt: '2026-10-22T09:30:00Z',
    status: 'Follow-up Required',
    followUpDate: '2026-10-31',
    message: 'Interested in EWS category fee concession and scholarship schemes under Uttarakhand Govt Social Welfare.',
    notes: [
      { id: 'note-1', author: 'Scholarship Desk', text: 'Requested updated EWS certificate valid for 2026-27 financial year.', createdAt: '2026-10-23T14:20:00Z' }
    ],
    history: [
      { timestamp: '2026-10-22T09:30:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' },
      { timestamp: '2026-10-23T14:20:00Z', action: 'Status Changed', details: 'Changed to Follow-up Required', performedBy: 'Scholarship Desk' }
    ]
  },
  {
    id: 'SLC-2026-009',
    name: 'Divya Adhikari',
    email: 'divya.adhikari@gmail.com',
    mobile: '9897123456',
    altMobile: '',
    course: 'LL.B (3-Year Degree)',
    city: 'Pithoragarh',
    state: 'Uttarakhand',
    academicScore: '77.0% in B.Sc (Govt PG College Pithoragarh)',
    category: 'General',
    createdAt: '2026-10-21T17:05:00Z',
    status: 'Admission Completed',
    followUpDate: null,
    message: 'Completed B.Sc PCM. Wish to pursue 3-Year LL.B. Submitted all documents offline during campus visit.',
    notes: [
      { id: 'note-1', author: 'Admissions Office', text: 'Application approved. Domicile & Degree verified.', createdAt: '2026-10-22T11:45:00Z' },
      { id: 'note-2', author: 'Admissions Office', text: 'Fees paid in full. ID card issued.', createdAt: '2026-10-23T10:00:00Z' }
    ],
    history: [
      { timestamp: '2026-10-21T17:05:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' },
      { timestamp: '2026-10-23T10:00:00Z', action: 'Status Changed', details: 'Admission Completed', performedBy: 'Admissions Office' }
    ]
  },
  {
    id: 'SLC-2026-010',
    name: 'Manish Mehra',
    email: 'manish.mehra.uk@gmail.com',
    mobile: '8171234567',
    altMobile: '',
    course: 'LL.B (3-Year Degree)',
    city: 'Rudrapur',
    state: 'Uttarakhand',
    academicScore: '59.2% in B.A.',
    category: 'SC',
    createdAt: '2026-10-20T13:40:00Z',
    status: 'Not Interested',
    followUpDate: null,
    message: 'Inquired about distance education LL.B.',
    notes: [
      { id: 'note-1', author: 'Admissions Desk', text: 'Explained Bar Council of India does NOT permit distance or online LL.B. Must be regular full-time campus course. Candidate opted out due to relocation constraints.', createdAt: '2026-10-21T09:30:00Z' }
    ],
    history: [
      { timestamp: '2026-10-20T13:40:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' },
      { timestamp: '2026-10-21T09:30:00Z', action: 'Status Changed', details: 'Changed to Not Interested (Distance education not eligible)', performedBy: 'Admissions Desk' }
    ]
  },
  {
    id: 'SLC-2026-011',
    name: 'Pooja Danu',
    email: 'pooja.danu.kapkot@yahoo.com',
    mobile: '9410987654',
    altMobile: '9410987655',
    course: 'B.A. LL.B (5-Year Integrated)',
    city: 'Bageshwar',
    state: 'Uttarakhand',
    academicScore: '83.0% in Class XII',
    category: 'ST',
    createdAt: '2026-10-19T10:25:00Z',
    status: 'Interested',
    followUpDate: '2026-11-05',
    message: 'Seeking admission in B.A. LL.B 5 years. Need information on reservation benefits and tribal welfare scholarship scheme.',
    notes: [
      { id: 'note-1', author: 'Counselor Sharma', text: 'Sent state reservation guidelines and document checklist for ST quota.', createdAt: '2026-10-20T12:00:00Z' }
    ],
    history: [
      { timestamp: '2026-10-19T10:25:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' },
      { timestamp: '2026-10-20T12:00:00Z', action: 'Status Changed', details: 'Changed to Interested', performedBy: 'Counselor Sharma' }
    ]
  },
  {
    id: 'SLC-2026-012',
    name: 'Deepak Chand',
    email: 'deepak.chand.adv@gmail.com',
    mobile: '7500123498',
    altMobile: '',
    course: 'LL.B (3-Year Degree)',
    city: 'Pithoragarh',
    state: 'Uttarakhand',
    academicScore: '69.8% in B.A.',
    category: 'General',
    createdAt: '2026-10-18T16:50:00Z',
    status: 'Contacted',
    followUpDate: '2026-11-02',
    message: 'Resident of Chandak road, Pithoragarh. Interested in 3-Year LL.B. When do lectures commence for the winter semester?',
    notes: [
      { id: 'note-1', author: 'Counselor Verma', text: 'Informed orientation week begins mid-November. Candidate visited library today.', createdAt: '2026-10-19T14:15:00Z' }
    ],
    history: [
      { timestamp: '2026-10-18T16:50:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' },
      { timestamp: '2026-10-19T14:15:00Z', action: 'Status Changed', details: 'Changed to Contacted', performedBy: 'Counselor Verma' }
    ]
  },
  {
    id: 'SLC-2026-013',
    name: 'Meenakshi Thapa',
    email: 'meenakshi.thapa@gmail.com',
    mobile: '8859123450',
    altMobile: '',
    course: 'B.A. LL.B (5-Year Integrated)',
    city: 'Dharchula',
    state: 'Uttarakhand',
    academicScore: '81.4% in Class XII',
    category: 'General',
    createdAt: '2026-10-17T11:15:00Z',
    status: 'New',
    followUpDate: '2026-11-03',
    message: 'From Dharchula border region. Want to inquire if hostel accommodation is guaranteed for female students from remote tehsils.',
    notes: [],
    history: [
      { timestamp: '2026-10-17T11:15:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-014',
    name: 'Tarun Goswami',
    email: 'tarun.goswami@outlook.com',
    mobile: '9837998877',
    altMobile: '',
    course: 'LL.M (2-Year Master of Laws)',
    city: 'Haridwar',
    state: 'Uttarakhand',
    academicScore: '73.5% in LL.B',
    category: 'OBC',
    createdAt: '2026-10-16T14:00:00Z',
    status: 'Interested',
    followUpDate: '2026-11-04',
    message: 'Seeking LL.M specialization in Corporate and Commercial Laws. What are the research publication requirements?',
    notes: [
      { id: 'note-1', author: 'Dean Office', text: 'Discussed dissertation requirements and seminar presentations under SSJ University norms.', createdAt: '2026-10-17T10:30:00Z' }
    ],
    history: [
      { timestamp: '2026-10-16T14:00:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' },
      { timestamp: '2026-10-17T10:30:00Z', action: 'Status Changed', details: 'Changed to Interested', performedBy: 'Dean Office' }
    ]
  },
  {
    id: 'SLC-2026-015',
    name: 'Bhavna Negi',
    email: 'bhavna.negi.law@gmail.com',
    mobile: '9760123987',
    altMobile: '',
    course: 'B.A. LL.B (5-Year Integrated)',
    city: 'Nainital',
    state: 'Uttarakhand',
    academicScore: '88.0% in Class XII',
    category: 'General',
    createdAt: '2026-10-15T09:10:00Z',
    status: 'Admission Completed',
    followUpDate: null,
    message: 'Applying for B.A. LL.B 5 Years. Completed Class 12 from St. Marys Convent Nainital with 88%.',
    notes: [
      { id: 'note-1', author: 'Admissions Office', text: 'Merit seat confirmed. Enrollment letter dispatched.', createdAt: '2026-10-16T15:00:00Z' }
    ],
    history: [
      { timestamp: '2026-10-15T09:10:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' },
      { timestamp: '2026-10-16T15:00:00Z', action: 'Status Changed', details: 'Admission Completed', performedBy: 'Admissions Office' }
    ]
  },
  {
    id: 'SLC-2026-016',
    name: 'Suraj Dhami',
    email: 'suraj.dhami2026@gmail.com',
    mobile: '9458963214',
    altMobile: '',
    course: 'LL.B (3-Year Degree)',
    city: 'Pithoragarh',
    state: 'Uttarakhand',
    academicScore: '62.4% in B.A.',
    category: 'General',
    createdAt: '2026-10-14T15:45:00Z',
    status: 'Follow-up Required',
    followUpDate: '2026-11-01',
    message: 'Local resident. Requesting fee installment payment options for 3-Year LL.B.',
    notes: [
      { id: 'note-1', author: 'Accounts Desk', text: 'Informed two-installment per semester scheme available upon approval by management.', createdAt: '2026-10-15T11:00:00Z' }
    ],
    history: [
      { timestamp: '2026-10-14T15:45:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' },
      { timestamp: '2026-10-15T11:00:00Z', action: 'Status Changed', details: 'Changed to Follow-up Required', performedBy: 'Accounts Desk' }
    ]
  },
  {
    id: 'SLC-2026-017',
    name: 'Komal Chauhan',
    email: 'komal.chauhan.law@gmail.com',
    mobile: '9870123456',
    altMobile: '',
    course: 'B.A. LL.B (5-Year Integrated)',
    city: 'New Delhi',
    state: 'Delhi',
    academicScore: '89.5% in Class XII (DPS RK Puram)',
    category: 'General',
    createdAt: '2026-10-13T10:00:00Z',
    status: 'Interested',
    followUpDate: '2026-11-04',
    message: 'Looking for peaceful academic environment in Himalayas for legal studies. Wanted details on faculty credentials and moot court competitions.',
    notes: [
      { id: 'note-1', author: 'Counselor Sharma', text: 'Sent detailed faculty profiles including former High Court judges guest lecture schedule.', createdAt: '2026-10-14T12:00:00Z' }
    ],
    history: [
      { timestamp: '2026-10-13T10:00:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-018',
    name: 'Aditya Karki',
    email: 'aditya.karki.law@gmail.com',
    mobile: '9917894561',
    altMobile: '',
    course: 'LL.B (3-Year Degree)',
    city: 'Pithoragarh',
    state: 'Uttarakhand',
    academicScore: '70.2% in B.Sc',
    category: 'General',
    createdAt: '2026-10-12T13:30:00Z',
    status: 'Contacted',
    followUpDate: '2026-11-03',
    message: 'Submitted inquiry about legal internship tie-ups with District & Sessions Court Pithoragarh.',
    notes: [
      { id: 'note-1', author: 'Admissions Desk', text: 'Shared internship cell handbook.', createdAt: '2026-10-13T09:00:00Z' }
    ],
    history: [
      { timestamp: '2026-10-12T13:30:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-019',
    name: 'Neelam Tiwari',
    email: 'neelam.tiwari@yahoo.co.in',
    mobile: '9412304567',
    altMobile: '',
    course: 'LL.M (2-Year Master of Laws)',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    academicScore: '76.8% in LL.B (Lucknow Univ)',
    category: 'General',
    createdAt: '2026-10-11T16:00:00Z',
    status: 'New',
    followUpDate: '2026-11-02',
    message: 'LL.B graduate from Lucknow University. Seeking admission to LL.M. Is non-domicile quota available?',
    notes: [],
    history: [
      { timestamp: '2026-10-11T16:00:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-020',
    name: 'Gaurav Kanyal',
    email: 'gaurav.kanyal@gmail.com',
    mobile: '7618234567',
    altMobile: '',
    course: 'B.A. LL.B (5-Year Integrated)',
    city: 'Didihat',
    state: 'Uttarakhand',
    academicScore: '80.0% in Class XII',
    category: 'General',
    createdAt: '2026-10-10T11:45:00Z',
    status: 'Follow-up Required',
    followUpDate: '2026-11-01',
    message: 'Inquiring regarding bus facility from Didihat or hostel availability.',
    notes: [
      { id: 'note-1', author: 'Transport Incharge', text: 'College bus runs from Pithoragarh main stand. Hostel recommended for students from Didihat.', createdAt: '2026-10-11T10:15:00Z' }
    ],
    history: [
      { timestamp: '2026-10-10T11:45:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-021',
    name: 'Pooja Chand',
    email: 'pooja.chand.law@gmail.com',
    mobile: '9456123789',
    altMobile: '',
    course: 'LL.B (3-Year Degree)',
    city: 'Champawat',
    state: 'Uttarakhand',
    academicScore: '67.5% in B.A.',
    category: 'General',
    createdAt: '2026-10-09T14:15:00Z',
    status: 'Admission Completed',
    followUpDate: null,
    message: 'Registered online and verified documents. Paid admission confirmation fee.',
    notes: [
      { id: 'note-1', author: 'Accounts Desk', text: 'Admission finalized under general merit list.', createdAt: '2026-10-11T14:00:00Z' }
    ],
    history: [
      { timestamp: '2026-10-09T14:15:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-022',
    name: 'Mohit Singh Bisht',
    email: 'mohit.bisht.pith@gmail.com',
    mobile: '9837654321',
    altMobile: '',
    course: 'B.A. LL.B (5-Year Integrated)',
    city: 'Pithoragarh',
    state: 'Uttarakhand',
    academicScore: '75.4% in Class XII',
    category: 'General',
    createdAt: '2026-10-08T10:30:00Z',
    status: 'Contacted',
    followUpDate: '2026-11-05',
    message: 'Interested in sports facilities, moot court room, and digital legal research database access (SCC Online / Manupatra).',
    notes: [
      { id: 'note-1', author: 'Librarian', text: 'Confirmed college campus has licensed subscriptions to SCC Online and AIR Web World.', createdAt: '2026-10-09T11:30:00Z' }
    ],
    history: [
      { timestamp: '2026-10-08T10:30:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-023',
    name: 'Suman Arya',
    email: 'suman.arya.law@gmail.com',
    mobile: '9639123456',
    altMobile: '',
    course: 'LL.B (3-Year Degree)',
    city: 'Almora',
    state: 'Uttarakhand',
    academicScore: '63.0% in B.A.',
    category: 'SC',
    createdAt: '2026-10-07T12:00:00Z',
    status: 'Interested',
    followUpDate: '2026-11-03',
    message: 'Applied for SC welfare scholarship. Seeking fee concession norms.',
    notes: [],
    history: [
      { timestamp: '2026-10-07T12:00:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-024',
    name: 'Rahul Garkoti',
    email: 'rahul.garkoti@gmail.com',
    mobile: '9719456123',
    altMobile: '',
    course: 'B.A. LL.B (5-Year Integrated)',
    city: 'Pithoragarh',
    state: 'Uttarakhand',
    academicScore: '85.0% in Class XII',
    category: 'General',
    createdAt: '2026-10-06T15:20:00Z',
    status: 'New',
    followUpDate: '2026-11-02',
    message: 'Enquiry for CLAT score acceptance vs direct merit admission under SSJ University.',
    notes: [],
    history: [
      { timestamp: '2026-10-06T15:20:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-025',
    name: 'Anjali Shah',
    email: 'anjali.shah.del@gmail.com',
    mobile: '9811234567',
    altMobile: '',
    course: 'LL.M (2-Year Master of Laws)',
    city: 'New Delhi',
    state: 'Delhi',
    academicScore: '75.0% in LL.B (Delhi Univ)',
    category: 'General',
    createdAt: '2026-10-05T09:40:00Z',
    status: 'Contacted',
    followUpDate: '2026-11-04',
    message: 'Graduated from Faculty of Law, DU. Seeking LL.M in Human Rights Law and Environmental Jurisprudence.',
    notes: [
      { id: 'note-1', author: 'Admissions Desk', text: 'Counseled on college research center on Himalayan Environmental Law.', createdAt: '2026-10-06T14:00:00Z' }
    ],
    history: [
      { timestamp: '2026-10-05T09:40:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-026',
    name: 'Kunal Bhandari',
    email: 'kunal.bhandari@yahoo.com',
    mobile: '9412987123',
    altMobile: '',
    course: 'LL.B (3-Year Degree)',
    city: 'Berinag',
    state: 'Uttarakhand',
    academicScore: '66.8% in B.Sc',
    category: 'General',
    createdAt: '2026-10-04T16:10:00Z',
    status: 'Follow-up Required',
    followUpDate: '2026-11-02',
    message: 'From Berinag. Queries regarding library timings and Saturday special lecture schedules.',
    notes: [],
    history: [
      { timestamp: '2026-10-04T16:10:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-027',
    name: 'Ritika Punetha',
    email: 'ritika.punetha@gmail.com',
    mobile: '9837012349',
    altMobile: '',
    course: 'B.A. LL.B (5-Year Integrated)',
    city: 'Pithoragarh',
    state: 'Uttarakhand',
    academicScore: '92.4% in Class XII',
    category: 'General',
    createdAt: '2026-10-03T11:00:00Z',
    status: 'Admission Completed',
    followUpDate: null,
    message: 'Direct admission under academic excellence scheme. Fees settled in full.',
    notes: [
      { id: 'note-1', author: 'Principal Office', text: 'Awarded 20% Founder Merit Scholarship on first year tuition fee for securing >90%.', createdAt: '2026-10-04T12:00:00Z' }
    ],
    history: [
      { timestamp: '2026-10-03T11:00:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-028',
    name: 'Sanjay Kumar',
    email: 'sanjay.kr.bar@rediffmail.com',
    mobile: '9458123098',
    altMobile: '',
    course: 'LL.B (3-Year Degree)',
    city: 'Bareilly',
    state: 'Uttar Pradesh',
    academicScore: '58.0% in B.A.',
    category: 'OBC',
    createdAt: '2026-10-02T13:15:00Z',
    status: 'Not Interested',
    followUpDate: null,
    message: 'Candidate took admission in Bareilly local college due to family reasons.',
    notes: [
      { id: 'note-1', author: 'Counselor Verma', text: 'Candidate informed admission taken in Bareilly.', createdAt: '2026-10-03T10:00:00Z' }
    ],
    history: [
      { timestamp: '2026-10-02T13:15:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-029',
    name: 'Tanvi Shrestha',
    email: 'tanvi.shrestha@gmail.com',
    mobile: '9897654312',
    altMobile: '',
    course: 'B.A. LL.B (5-Year Integrated)',
    city: 'Dehradun',
    state: 'Uttarakhand',
    academicScore: '84.0% in Class XII',
    category: 'General',
    createdAt: '2026-10-01T10:00:00Z',
    status: 'Interested',
    followUpDate: '2026-11-04',
    message: 'Comparing with colleges in Dehradun. Wanted details on BCI approval letter and faculty to student ratio.',
    notes: [
      { id: 'note-1', author: 'Admissions Desk', text: 'Provided official BCI approval notification copy and faculty credentials.', createdAt: '2026-10-02T14:30:00Z' }
    ],
    history: [
      { timestamp: '2026-10-01T10:00:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  },
  {
    id: 'SLC-2026-030',
    name: 'Bhupendra Singh Chuphal',
    email: 'bhupendra.chuphal@gmail.com',
    mobile: '9411122334',
    altMobile: '',
    course: 'LL.B (3-Year Degree)',
    city: 'Pithoragarh',
    state: 'Uttarakhand',
    academicScore: '72.0% in B.A.',
    category: 'General',
    createdAt: '2026-09-28T15:00:00Z',
    status: 'Admission Completed',
    followUpDate: null,
    message: 'Admitted in 3-Year LL.B. Enrolled in legal clinic program.',
    notes: [],
    history: [
      { timestamp: '2026-09-28T15:00:00Z', action: 'Lead Created', details: 'Web enquiry submitted', performedBy: 'Website Form' }
    ]
  }
];

export class MockDataProvider {
  static getStoredLeads() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[MockDataProvider] Error reading localStorage, falling back to initial mock set:', e);
    }
    // Initialize default set if empty
    this.saveLeads(INITIAL_MOCK_LEADS);
    return INITIAL_MOCK_LEADS;
  }

  static saveLeads(leads) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error('[MockDataProvider] Error writing to localStorage:', e);
    }
  }

  static resetToDefault() {
    this.saveLeads(INITIAL_MOCK_LEADS);
    localStorage.setItem(RESET_TIMESTAMP_KEY, new Date().toISOString());
    return INITIAL_MOCK_LEADS;
  }
}
