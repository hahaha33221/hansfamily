import initialMembers from '../data/members.json';

const STORAGE_KEY = 'hansfamily_members';

/**
 * 로컬스토리지에서 구성원 목록을 불러옵니다.
 * 데이터가 없으면 초기 members.json 데이터를 주입하고 반환합니다.
 */
export function getStoredMembers() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMembers));
    return initialMembers;
  }
  try {
    const parsed = JSON.parse(stored);
    if (parsed.length !== 53 || parsed.some(m => m.category === 'direct' || m.category === 'child')) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMembers));
      return initialMembers;
    }

    // Clean up '미혼' from notes in local storage if present
    let modified = false;
    const cleaned = parsed.map(m => {
      if (m.note && m.note.includes('미혼')) {
        modified = true;
        let newNote = m.note
          .replace(/미혼\s*·\s*/g, '')
          .replace(/\s*·\s*미혼/g, '')
          .replace(/미혼/g, '')
          .trim();
        return { ...m, note: newNote };
      }
      return m;
    });

    if (modified) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      return cleaned;
    }

    return parsed;
  } catch (e) {
    console.error("Failed to parse stored members:", e);
    return initialMembers;
  }
}

/**
 * 로컬스토리지에 구성원 목록을 저장합니다.
 */
export function saveStoredMembers(members) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}
