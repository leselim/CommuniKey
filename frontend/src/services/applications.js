import { useEffect, useState } from 'react';

/*
 * Households waiting for proof of residence to be checked.
 *
 * The estate overview and the members screen both work this queue, so it is
 * held in one place. Approving from the overview removes it from the members
 * screen as well, which is what an administrator expects.
 */

const PENDING_APPLICATIONS = [
  {
    id: 101,
    name: 'Kobus van der Merwe',
    address: '29 Mill Road, Section B',
    email: 'kobus.vdm@riverside.co.za',
    phone: '+27 82 888 1234',
    documentType: 'Municipal water bill',
    fileName: 'WaterBill_29MillRd_Aug2026.pdf',
    uploadedTime: 'Yesterday at 16:40',
    status: 'Pending Verification',
  },
  {
    id: 102,
    name: 'Amina Patel',
    address: '5 Riverside Drive, Section A',
    email: 'amina.patel@riverside.co.za',
    phone: '+27 83 999 5678',
    documentType: 'Lease agreement',
    fileName: 'Lease_5RiversideDr_2026.pdf',
    uploadedTime: 'Two days ago at 11:15',
    status: 'Pending Verification',
  },
];

let queue = PENDING_APPLICATIONS;
const listeners = new Set();

function publish(next) {
  queue = next;
  listeners.forEach((listener) => listener(queue));
}

export function decideApplication(id) {
  publish(queue.filter((item) => item.id !== id));
}

export default function useApplications() {
  const [items, setItems] = useState(queue);

  useEffect(() => {
    listeners.add(setItems);
    setItems(queue);
    return () => listeners.delete(setItems);
  }, []);

  return { applications: items, decide: decideApplication };
}
