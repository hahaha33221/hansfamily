/**
 * 한글 이름 조사(vocative particle) 처리
 * 받침이 있으면 '아', 없으면 '야'를 붙임
 */
export function getVocative(name) {
  if (!name) return "";
  const lastChar = name.charCodeAt(name.length - 1);
  if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) {
    const batchim = (lastChar - 0xAC00) % 28;
    return batchim > 0 ? `${name}아` : `${name}야`;
  }
  return `${name}(아/야)`;
}

/**
 * 두 구성원(memberA: 나, memberB: 상대방) 간의 호칭 및 관계를 계산합니다.
 * @param {Object} memberA - 나
 * @param {Object} memberB - 상대방
 * @param {Array} members - 전체 가족 구성원 배열
 * @returns {Object} { aCallsB, bCallsA, relation, note }
 */
export function getHonorific(memberA, memberB, members) {
  if (!memberA || !memberB) {
    return { aCallsB: "-", bCallsA: "-", relation: "-", note: "" };
  }

  // 1. 자기 자신
  if (memberA.id === memberB.id) {
    return {
      aCallsB: "나",
      bCallsA: "나",
      relation: "본인",
      note: "자기 자신입니다."
    };
  }

  // 2. 배우자 관계 (부부)
  if (memberA.spouseId === memberB.id || memberB.spouseId === memberA.id) {
    return {
      aCallsB: "여보 / 당신",
      bCallsA: "여보 / 당신",
      relation: "배우자",
      note: "부부 관계입니다."
    };
  }

  // 3. 부모-자식 관계
  const isAparentOfB = memberB.parentIds && memberB.parentIds.includes(memberA.id);
  const isBparentOfA = memberA.parentIds && memberA.parentIds.includes(memberB.id);

  if (isAparentOfB) {
    return {
      aCallsB: getVocative(memberB.name),
      bCallsA: memberA.gender === "female" ? "엄마" : "아빠",
      relation: "부모 / 자식",
      note: `${memberA.name}은(는) ${memberB.name}의 부모입니다.`
    };
  }

  if (isBparentOfA) {
    return {
      aCallsB: memberB.gender === "female" ? "엄마" : "아빠",
      bCallsA: getVocative(memberA.name),
      relation: "부모 / 자식",
      note: `${memberB.name}은(는) ${memberA.name}의 부모입니다.`
    };
  }

  // 4. 세대별 구분
  const isAChild = memberA.category === "child";
  const isBChild = memberB.category === "child";

  // 4-1. 어른-자녀 관계 (세대 혼합)
  if (!isAChild && isBChild) {
    // A는 어른, B는 자녀
    // A가 B의 이모부, 고모, 삼촌 등인지 판별하기 위해 B의 부모를 찾음
    const bParents = members.filter(m => memberB.parentIds && memberB.parentIds.includes(m.id));
    let relationDetail = "오촌 조카";
    
    return {
      aCallsB: getVocative(memberB.name),
      bCallsA: memberA.gender === "male" ? "아저씨" : "아주머니",
      relation: `오촌 (${relationDetail})`,
      note: `${memberA.name}은(는) ${memberB.name}의 5촌 당숙/당고모(이모/삼촌) 항렬입니다.`
    };
  }

  if (isAChild && !isBChild) {
    // A는 자녀, B는 어른 (역방향 호출)
    const reversed = getHonorific(memberB, memberA, members);
    return {
      aCallsB: reversed.bCallsA,
      bCallsA: reversed.aCallsB,
      relation: reversed.relation,
      note: reversed.note
    };
  }

  // 4-2. 자녀 세대끼리의 관계 (child ↔ child)
  if (isAChild && isBChild) {
    const ageDiff = (memberB.birthYear || 0) - (memberA.birthYear || 0); // 음수이면 B가 나이가 더 많음(출생연도가 더 작음)
    
    if (ageDiff < 0) {
      // B가 나이가 더 많음 (손위)
      let title = "";
      if (memberA.gender === "male") {
        title = memberB.gender === "male" ? "형" : "누나";
      } else if (memberA.gender === "female") {
        title = memberB.gender === "male" ? "오빠" : "언니";
      } else {
        title = memberB.gender === "male" ? "형 / 오빠" : "누나 / 언니";
      }
      return {
        aCallsB: title,
        bCallsA: getVocative(memberA.name),
        relation: "사촌 (자녀)",
        note: `자녀 세대 사촌 관계입니다. (${memberB.name}이(가) 연장자)`
      };
    } else if (ageDiff > 0) {
      // B가 나이가 더 적음 (손아래)
      let reversedTitle = "";
      if (memberB.gender === "male") {
        reversedTitle = memberA.gender === "male" ? "형" : "누나";
      } else if (memberB.gender === "female") {
        reversedTitle = memberA.gender === "male" ? "오빠" : "언니";
      } else {
        reversedTitle = memberA.gender === "male" ? "형 / 오빠" : "누나 / 언니";
      }
      return {
        aCallsB: getVocative(memberB.name),
        bCallsA: reversedTitle,
        relation: "사촌 (자녀)",
        note: `자녀 세대 사촌 관계입니다. (${memberA.name}이(가) 연장자)`
      };
    } else {
      // 동갑
      return {
        aCallsB: getVocative(memberB.name),
        bCallsA: getVocative(memberA.name),
        relation: "사촌 (자녀·동갑)",
        note: `자녀 세대 동갑내기 사촌 관계입니다.`
      };
    }
  }

  // 4-3. 어른 세대끼리의 관계 (G1 ↔ G1)
  const isADirect = memberA.category === "direct" || memberA.category === "single";
  const isBDirect = memberB.category === "direct" || memberB.category === "single";

  // 1) 둘 다 직계/미혼 사촌인 경우
  if (isADirect && isBDirect) {
    const ageDiff = (memberB.birthYear || 0) - (memberA.birthYear || 0); // B.birthYear가 더 작으면 B가 형/누나
    
    if (ageDiff < 0) {
      let title = "";
      if (memberA.gender === "male") {
        title = memberB.gender === "male" ? "형" : "누나";
      } else if (memberA.gender === "female") {
        title = memberB.gender === "male" ? "오빠" : "언니";
      } else {
        title = memberB.gender === "male" ? "형 / 오빠" : "누나 / 언니";
      }
      return {
        aCallsB: title,
        bCallsA: getVocative(memberA.name),
        relation: "사촌",
        note: `사촌 관계입니다. (${memberB.name}이(가) 연장자)`
      };
    } else if (ageDiff > 0) {
      let reversedTitle = "";
      if (memberB.gender === "male") {
        reversedTitle = memberA.gender === "male" ? "형" : "누나";
      } else if (memberB.gender === "female") {
        reversedTitle = memberA.gender === "male" ? "오빠" : "언니";
      } else {
        reversedTitle = memberA.gender === "male" ? "형 / 오빠" : "누나 / 언니";
      }
      return {
        aCallsB: getVocative(memberB.name),
        bCallsA: reversedTitle,
        relation: "사촌",
        note: `사촌 관계입니다. (${memberA.name}이(가) 연장자)`
      };
    } else {
      return {
        aCallsB: getVocative(memberB.name),
        bCallsA: getVocative(memberA.name),
        relation: "사촌 (동갑)",
        note: "동갑내기 사촌 관계입니다."
      };
    }
  }

  // 2) 한 명은 직계, 한 명은 사촌의 배우자인 경우
  if (isADirect && !isBDirect) {
    const bs = members.find(m => m.id === memberB.spouseId);
    if (!bs) {
      // 배우자를 찾을 수 없는 경우 나이 비교로 임시 처리
      return getHonorificDirectAge(memberA, memberB);
    }
    
    const ageDiff = (bs.birthYear || 0) - (memberA.birthYear || 0); // bs가 더 작으면 bs가 손위
    
    if (ageDiff < 0) {
      // 상대방 배우자(bs)가 나보다 나이가 많음 (손위 사촌의 배우자)
      if (bs.gender === "male") {
        // 손위 남자 사촌의 아내 -> 형수님/새언니
        return {
          aCallsB: memberA.gender === "male" ? "형수님" : "새언니",
          bCallsA: memberA.gender === "male" ? "도련님 / 서방님" : "아가씨",
          relation: "사촌 형수 / 올케",
          note: `${memberB.name}은(는) ${memberA.name}의 사촌 형(오빠)인 ${bs.name}의 아내입니다.`
        };
      } else {
        // 손위 여자 사촌의 남편 -> 매형/형부
        return {
          aCallsB: memberA.gender === "male" ? "매형" : "형부",
          bCallsA: memberA.gender === "male" ? "처남" : "처제",
          relation: "사촌 자형 / 형부",
          note: `${memberB.name}은(는) ${memberA.name}의 사촌 누나(언니)인 ${bs.name}의 남편입니다.`
        };
      }
    } else {
      // 상대방 배우자(bs)가 나보다 나이가 적음 (손아래 사촌의 배우자)
      if (bs.gender === "male") {
        // 손아래 남자 사촌의 아내 -> 제수씨/올케
        return {
          aCallsB: memberA.gender === "male" ? "제수씨" : "올케",
          bCallsA: memberA.gender === "male" ? "아주버님" : "형님",
          relation: "사촌 제수 / 올케",
          note: `${memberB.name}은(는) ${memberA.name}의 사촌 동생인 ${bs.name}의 아내입니다.`
        };
      } else {
        // 손아래 여자 사촌의 남편 -> 매제/제부
        return {
          aCallsB: memberA.gender === "male" ? "매제" : "제부",
          bCallsA: memberA.gender === "male" ? "처남" : "처형",
          relation: "사촌 매제 / 제부",
          note: `${memberB.name}은(는) ${memberA.name}의 사촌 동생인 ${bs.name}의 남편입니다.`
        };
      }
    }
  }

  // 3) 내가 배우자이고 상대방이 직계인 경우 (역방향 계산)
  if (!isADirect && isBDirect) {
    const reversed = getHonorific(memberB, memberA, members);
    return {
      aCallsB: reversed.bCallsA,
      bCallsA: reversed.aCallsB,
      relation: reversed.relation,
      note: reversed.note
    };
  }

  // 4) 둘 다 배우자인 경우 (동서 관계)
  if (!isADirect && !isBDirect) {
    const as = members.find(m => m.id === memberA.spouseId);
    const bs = members.find(m => m.id === memberB.spouseId);
    
    if (!as || !bs) {
      return {
        aCallsB: "동서",
        bCallsA: "동서",
        relation: "동서",
        note: "배우자 간의 동서 관계입니다."
      };
    }

    const ageDiff = (bs.birthYear || 0) - (as.birthYear || 0); // bs의 혈통(사촌) 나이가 많으면 손위
    
    if (memberA.gender === memberB.gender) {
      if (memberA.gender === "female") {
        // 아내들끼리
        if (ageDiff < 0) {
          return {
            aCallsB: "형님",
            bCallsA: "동서",
            relation: "동서",
            note: `남편의 사촌 형인 ${bs.name}의 아내 ${memberB.name}이(가) 손위 동서입니다.`
          };
        } else {
          return {
            aCallsB: "동서",
            bCallsA: "형님",
            relation: "동서",
            note: `남편의 사촌 동생인 ${bs.name}의 아내 ${memberB.name}이(가) 손아래 동서입니다.`
          };
        }
      } else {
        // 남편들끼리
        if (ageDiff < 0) {
          return {
            aCallsB: "형님",
            bCallsA: "동서",
            relation: "동서",
            note: `아내의 사촌 언니(누나)인 ${bs.name}의 남편 ${memberB.name}이(가) 손위 동서입니다.`
          };
        } else {
          return {
            aCallsB: "동서",
            bCallsA: "형님",
            relation: "동서",
            note: `아내의 사촌 동생인 ${bs.name}의 남편 ${memberB.name}이(가) 손아래 동서입니다.`
          };
        }
      }
    } else {
      // 서로 다른 성별의 배우자들
      return {
        aCallsB: `${memberB.name} 씨`,
        bCallsA: `${memberA.name} 씨`,
        relation: "동서 (사돈)",
        note: `사촌의 배우자 상호 간 관계입니다.`
      };
    }
  }

  return { aCallsB: "-", bCallsA: "-", relation: "가족", note: "" };
}

/**
 * 예외용 나이 단순 호칭 계산
 */
function getHonorificDirectAge(memberA, memberB) {
  const ageDiff = (memberB.birthYear || 0) - (memberA.birthYear || 0);
  if (ageDiff < 0) {
    const title = memberA.gender === "male" ? 
      (memberB.gender === "male" ? "형" : "누나") : 
      (memberB.gender === "male" ? "오빠" : "언니");
    return {
      aCallsB: title,
      bCallsA: getVocative(memberA.name),
      relation: "친척",
      note: "나이 순 친척 관계입니다."
    };
  } else {
    const reversedTitle = memberB.gender === "male" ? 
      (memberA.gender === "male" ? "형" : "누나") : 
      (memberA.gender === "male" ? "오빠" : "언니");
    return {
      aCallsB: getVocative(memberB.name),
      bCallsA: reversedTitle,
      relation: "친척",
      note: "나이 순 친척 관계입니다."
    };
  }
}
