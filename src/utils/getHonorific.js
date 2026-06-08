export const CATEGORY_LABEL = {
  generation1: '조부모',
  generation2: '직계 형제자매',
  generation3: '사촌',
  generation4: '자녀',
  spouse: '배우자',
};

export const CATEGORY_TAG = {
  generation1: 'tag-direct',
  generation2: 'tag-direct',
  generation3: 'tag-direct',
  generation4: 'tag-child',
  spouse: 'tag-spouse',
};

export const INITIAL_CLASS = {
  generation1: 'initial-direct',
  generation2: 'initial-direct',
  generation3: 'initial-direct',
  generation4: 'initial-child',
  spouse: 'initial-spouse',
};

/**
 * 한글 이름 조사(vocative particle) 처리
 * 받침이 있으면 '아', 없으면 '야'를 붙임
 */
export function getFirstName(name) {
  if (!name) return "";
  if (name.length > 1) {
    return name.substring(1);
  }
  return name;
}

export function getVocative(name) {
  if (!name) return "";
  const firstName = getFirstName(name);
  const lastChar = firstName.charCodeAt(firstName.length - 1);
  if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) {
    const batchim = (lastChar - 0xAC00) % 28;
    return batchim > 0 ? `${firstName}아` : `${firstName}야`;
  }
  return `${firstName}(아/야)`;
}

/**
 * A가 B보다 연장자(서열이 높은지)인지 판별하는 함수 (동갑 서열 판별 포함)
 * @returns {boolean} A가 B보다 연장자이면 true
 */
export function isOlderThan(memberA, memberB, members) {
  const yearA = memberA.birthYear;
  const yearB = memberB.birthYear;

  if (yearA !== yearB) {
    // 생년월일이 명확히 다르면, 태어난 연도가 작을수록 연장자
    if (yearA !== null && yearB !== null) {
      return yearA < yearB;
    }
    return false;
  }

  // 출생년도가 같은 동갑내기인 경우
  // 1) 2세대 직계끼리: 데이터 상 동갑이 없으므로 false 반환
  if (memberA.category === 'generation2' && memberB.category === 'generation2') {
    return false;
  }

  // 2) 3세대 사촌끼리: 부모(2세대 직계)의 나이순으로 서열 결정
  if (memberA.category === 'generation3' && memberB.category === 'generation3') {
    const parentA = members.find(m => memberA.parentIds && memberA.parentIds.includes(m.id) && m.category === 'generation2');
    const parentB = members.find(m => memberB.parentIds && memberB.parentIds.includes(m.id) && m.category === 'generation2');
    
    if (parentA && parentB) {
      if (parentA.id !== parentB.id) {
        return (parentA.birthYear || 0) < (parentB.birthYear || 0);
      } else {
        // 같은 부모를 공유하는 형제간 동갑내기 (김봉만 c3 > 김흥만 c4)
        // ID 번호 순서에 따라 처리 (c3가 c4보다 작으므로 연장자)
        const idNumA = parseInt(memberA.id.replace('c', ''), 10);
        const idNumB = parseInt(memberB.id.replace('c', ''), 10);
        return idNumA < idNumB;
      }
    }
  }

  // 3) 4세대 자녀(6촌)끼리: 부모(3세대 직계)의 나이/서열순으로 결정 (재귀 판별)
  if (memberA.category === 'generation4' && memberB.category === 'generation4') {
    const parentA = members.find(m => memberA.parentIds && memberA.parentIds.includes(m.id) && m.category === 'generation3');
    const parentB = members.find(m => memberB.parentIds && memberB.parentIds.includes(m.id) && m.category === 'generation3');
    
    if (parentA && parentB) {
      if (parentA.id !== parentB.id) {
        return isOlderThan(parentA, parentB, members);
      } else {
        // 같은 부모를 공유하는 형제 (id 순)
        const idNumA = parseInt(memberA.id.replace('d', ''), 10);
        const idNumB = parseInt(memberB.id.replace('d', ''), 10);
        return idNumA < idNumB;
      }
    }
  }

  return false;
}

/**
 * A가 B의 조부모인지 판별하는 함수
 */
export function isGrandparentOf(memberA, memberB, members) {
  if (!memberB.parentIds || memberB.parentIds.length === 0) return false;
  const parentsB = members.filter(m => memberB.parentIds.includes(m.id));
  for (const parent of parentsB) {
    if (parent.parentIds && parent.parentIds.includes(memberA.id)) {
      return true;
    }
  }
  return false;
}

/**
 * 직계 사촌과 사촌 배우자 간의 호칭을 구하는 헬퍼 함수
 */
function getInLawTerm(directMember, spouseMember, members) {
  const spouseDirect = members.find(m => m.id === spouseMember.spouseId);
  if (!spouseDirect) {
    return { directCallsSpouse: `${spouseMember.name} 씨`, spouseCallsDirect: `${directMember.name} 씨` };
  }

  // directMember와 spouseDirect의 나이 서열 비교
  const isDirectOlder = isOlderThan(directMember, spouseDirect, members);

  if (!isDirectOlder) {
    // 직계 구성원이 나이가 더 적음 ➜ 상대방 배우자(spouseDirect)가 손위
    if (spouseDirect.gender === 'male') {
      // 손위 남자 사촌의 아내 ➜ 형수님 / 도련님·아가씨
      return {
        directCallsSpouse: directMember.gender === 'male' ? '형수님' : '새언니',
        spouseCallsDirect: directMember.gender === 'male' ? '도련님' : '아가씨'
      };
    } else {
      // 손위 여자 사촌의 남편 ➜ 매형·형부 / 처남·처제
      return {
        directCallsSpouse: directMember.gender === 'male' ? '매형' : '형부',
        spouseCallsDirect: directMember.gender === 'male' ? '처남' : '처제'
      };
    }
  } else {
    // 직계 구성원이 나이가 더 많음 ➜ 상대방 배우자(spouseDirect)가 손아래
    if (spouseDirect.gender === 'male') {
      // 손아래 남자 사촌의 아내 ➜ 제수씨·올케 / 아주버님·형님
      return {
        directCallsSpouse: directMember.gender === 'male' ? '제수씨' : '올케',
        spouseCallsDirect: directMember.gender === 'male' ? '아주버님' : '형님'
      };
    } else {
      // 손아래 여자 사촌의 남편 ➜ 매제·제부 / 처남·처형
      return {
        directCallsSpouse: directMember.gender === 'male' ? '매제' : '제부',
        spouseCallsDirect: directMember.gender === 'male' ? '처남' : '처형'
      };
    }
  }
}

/**
 * 두 구성원 간의 세대별 관계 해결기
 */
function getGen(member, members) {
  if (member.category === 'spouse') {
    const sp = members.find(m => m.id === member.spouseId);
    return sp ? sp.category : 'generation3';
  }
  return member.category;
}

export function getHonorific(memberA, memberB, members) {
  if (!memberA || !memberB) {
    return { aCallsB: "-", bCallsA: "-", relation: "-", note: "" };
  }

  // 1. 본인
  if (memberA.id === memberB.id) {
    return { aCallsB: "나", bCallsA: "나", relation: "본인", note: "자기 자신입니다." };
  }

  // 2. 배우자 (부부)
  if (memberA.spouseId === memberB.id || memberB.spouseId === memberA.id) {
    return { aCallsB: "여보 / 당신", bCallsA: "여보 / 당신", relation: "배우자", note: "부부 관계입니다." };
  }

  // 3. 직계 부모 자식 관계
  const isAparentOfB = memberB.parentIds && memberB.parentIds.includes(memberA.id);
  const isBparentOfA = memberA.parentIds && memberA.parentIds.includes(memberB.id);

  if (isAparentOfB) {
    return {
      aCallsB: getVocative(memberB.name),
      bCallsA: memberA.gender === 'female' ? '엄마' : '아빠',
      relation: '부모 / 자식',
      note: `${memberA.name}은(는) ${memberB.name}의 부모입니다.`
    };
  }

  if (isBparentOfA) {
    return {
      aCallsB: memberB.gender === 'female' ? '엄마' : '아빠',
      bCallsA: getVocative(memberA.name),
      relation: '부모 / 자식',
      note: `${memberB.name}은(는) ${memberA.name}의 부모입니다.`
    };
  }

  // 3.1. 직계 조부모 손자녀 관계 (2대 차이 직계)
  if (isGrandparentOf(memberA, memberB, members)) {
    return {
      aCallsB: getVocative(memberB.name),
      bCallsA: memberA.gender === 'male' ? '할아버지' : '할머니',
      relation: '조부모 / 손자녀',
      note: `${memberA.name}은(는) ${memberB.name}의 조부모입니다.`
    };
  }

  if (isGrandparentOf(memberB, memberA, members)) {
    return {
      aCallsB: memberB.gender === 'male' ? '할아버지' : '할머니',
      bCallsA: getVocative(memberA.name),
      relation: '조부모 / 손자녀',
      note: `${memberB.name}은(는) ${memberA.name}의 조부모입니다.`
    };
  }

  // 3.2. 직계 부모의 배우자 또는 자식의 배우자 관계 (시부모/장인·장모 ↔ 사위/며느리)
  const spouseB = memberB.spouseId ? members.find(m => m.id === memberB.spouseId) : null;
  if (spouseB && spouseB.parentIds && spouseB.parentIds.includes(memberA.id)) {
    let aCallsB = "";
    let bCallsA = "";
    if (memberB.gender === 'male') {
      aCallsB = `${memberB.name.substring(1)} 서방`;
      bCallsA = memberA.gender === 'male' ? '장인어른' : '장모님';
    } else {
      aCallsB = memberA.gender === 'male' ? '아가' : '새아기';
      bCallsA = memberA.gender === 'male' ? '아버님' : '어머님';
    }
    return {
      aCallsB,
      bCallsA,
      relation: memberB.gender === 'male' ? '장인·장모 / 사위' : '시부모 / 며느리',
      note: `${memberA.name}은(는) ${spouseB.name}의 부모이며, ${memberB.name}은(는) ${spouseB.name}의 배우자입니다.`
    };
  }

  const spouseA = memberA.spouseId ? members.find(m => m.id === memberA.spouseId) : null;
  if (spouseA && spouseA.parentIds && spouseA.parentIds.includes(memberB.id)) {
    let aCallsB = "";
    let bCallsA = "";
    if (memberA.gender === 'male') {
      aCallsB = memberB.gender === 'male' ? '장인어른' : '장모님';
      bCallsA = `${memberA.name.substring(1)} 서방`;
    } else {
      aCallsB = memberB.gender === 'male' ? '아버님' : '어머님';
      bCallsA = memberB.gender === 'male' ? '아가' : '새아기';
    }
    return {
      aCallsB,
      bCallsA,
      relation: memberA.gender === 'male' ? '장인·장모 / 사위' : '시부모 / 며느리',
      note: `${memberB.name}은(는) ${spouseA.name}의 부모이며, ${memberA.name}은(는) ${spouseA.name}의 배우자입니다.`
    };
  }

  // 3.3. 직계 조부모의 배우자 또는 손자녀의 배우자 관계 (조부모 ↔ 손주며느리/손주사위)
  if (spouseB && isGrandparentOf(memberA, spouseB, members)) {
    let aCallsB = memberB.gender === 'male' ? `${memberB.name.substring(1)} 서방` : (memberA.gender === 'male' ? '아가' : '새아기');
    let bCallsA = memberA.gender === 'male' ? '할아버님' : '할머님';
    return {
      aCallsB,
      bCallsA,
      relation: '조부모 / 손주배우자',
      note: `${memberA.name}은(는) ${spouseB.name}의 조부모이며, ${memberB.name}은(는) ${spouseB.name}의 배우자입니다.`
    };
  }

  if (spouseA && isGrandparentOf(memberB, spouseA, members)) {
    let aCallsB = memberB.gender === 'male' ? '할아버님' : '할머님';
    let bCallsA = memberA.gender === 'male' ? `${memberA.name.substring(1)} 서방` : (memberB.gender === 'male' ? '아가' : '새아기');
    return {
      aCallsB,
      bCallsA,
      relation: '조부모 / 손주배우자',
      note: `${memberB.name}은(는) ${spouseA.name}의 조부모이며, ${memberA.name}은(는) ${spouseA.name}의 배우자입니다.`
    };
  }

  // 세대 추출 (배우자 포함)
  const genA = getGen(memberA, members);
  const genB = getGen(memberB, members);

  // -------------------------------------------------------------------------
  // Case A: 동일 세대간의 관계
  // -------------------------------------------------------------------------
  if (genA === genB) {
    const isADirect = memberA.category !== 'spouse';
    const isBDirect = memberB.category !== 'spouse';

    // 1) 둘 다 직계인 경우
    if (isADirect && isBDirect) {
      const isAOlder = isOlderThan(memberA, memberB, members);
      const isBOlder = isOlderThan(memberB, memberA, members);

      if (isBOlder) {
        // B가 형/누나/오빠/언니
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
          relation: genA === 'generation2' ? '형제자매' : (genA === 'generation3' ? '사촌' : '재종사촌 (6촌)'),
          note: `동일 세대 친족 관계입니다. (${memberB.name}이(가) 연장자)`
        };
      } else if (isAOlder) {
        // A가 형/누나/오빠/언니
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
          relation: genA === 'generation2' ? '형제자매' : (genA === 'generation3' ? '사촌' : '재종사촌 (6촌)'),
          note: `동일 세대 친족 관계입니다. (${memberA.name}이(가) 연장자)`
        };
      } else {
        // 동갑
        return {
          aCallsB: getVocative(memberB.name),
          bCallsA: getVocative(memberA.name),
          relation: genA === 'generation2' ? '동갑 형제자매' : (genA === 'generation3' ? '사촌 (동갑)' : '재종사촌 (동갑)'),
          note: "동갑내기 친족 관계입니다."
        };
      }
    }

    // 2) 직계와 배우자 간의 관계
    if (isADirect && !isBDirect) {
      const res = getInLawTerm(memberA, memberB, members);
      return {
        aCallsB: res.directCallsSpouse,
        bCallsA: res.spouseCallsDirect,
        relation: '친족 배우자',
        note: `${memberB.name}은(는) ${memberA.name}의 사촌(또는 형제)의 배우자입니다.`
      };
    }

    if (!isADirect && isBDirect) {
      const res = getInLawTerm(memberB, memberA, members);
      return {
        aCallsB: res.spouseCallsDirect,
        bCallsA: res.directCallsSpouse,
        relation: '친족 배우자',
        note: `${memberA.name}은(는) ${memberB.name}의 사촌(또는 형제)의 배우자입니다.`
      };
    }

    // 3) 둘 다 배우자인 경우 (동서 관계)
    if (!isADirect && !isBDirect) {
      const as = members.find(m => m.id === memberA.spouseId);
      const bs = members.find(m => m.id === memberB.spouseId);
      
      if (!as || !bs) {
        return { aCallsB: "동서", bCallsA: "동서", relation: "동서", note: "배우자 간의 동서 관계입니다." };
      }

      const isAsOlder = isOlderThan(as, bs, members);

      if (memberA.gender === memberB.gender) {
        if (memberA.gender === "female") {
          // 남편들의 동서 서열
          if (!isAsOlder) {
            return { aCallsB: "형님", bCallsA: "동서", relation: "동서", note: `남편의 사촌 형(또는 형제)인 ${bs.name}의 아내 ${memberB.name}이(가) 손위 동서입니다.` };
          } else {
            return { aCallsB: "동서", bCallsA: "형님", relation: "동서", note: `남편의 사촌 동생인 ${bs.name}의 아내 ${memberB.name}이(가) 손아래 동서입니다.` };
          }
        } else {
          // 아내들의 동서 서열
          if (!isAsOlder) {
            return { aCallsB: "형님", bCallsA: "동서", relation: "동서", note: `아내의 사촌 언니(누나)인 ${bs.name}의 남편 ${memberB.name}이(가) 손위 동서입니다.` };
          } else {
            return { aCallsB: "동서", bCallsA: "형님", relation: "동서", note: `아내의 사촌 동생인 ${bs.name}의 남편 ${memberB.name}이(가) 손아래 동서입니다.` };
          }
        }
      } else {
        return { aCallsB: `${memberB.name} 씨`, bCallsA: `${memberA.name} 씨`, relation: "동서", note: "친족 배우자 간의 상호 존칭 관계입니다." };
      }
    }
  }

  // -------------------------------------------------------------------------
  // Case B: 세대가 다른 친족 관계
  // -------------------------------------------------------------------------
  
  // 3세대 ↔ 2세대 (조카 ↔ 이모/고모/삼촌/외삼촌 및 그 배우자)
  if ((genA === 'generation3' && genB === 'generation2') || (genA === 'generation2' && genB === 'generation3')) {
    const isAgeneration3 = genA === 'generation3';
    const nieceNephew = isAgeneration3 ? memberA : memberB;
    const auntUncle = isAgeneration3 ? memberB : memberA;

    // 조카 또는 조카의 배우자
    const isNieceNephewSpouse = nieceNephew.category === 'spouse';
    const directNieceNephew = isNieceNephewSpouse ? members.find(m => m.id === nieceNephew.spouseId) : nieceNephew;

    // 조카의 직계 부모 찾기
    const parentDirect = directNieceNephew ? members.find(m => directNieceNephew.parentIds && directNieceNephew.parentIds.includes(m.id) && m.category === 'generation2') : null;
    
    if (parentDirect) {
      let auntUncleTitle = "";
      let relationType = isNieceNephewSpouse ? "숙질 배우자 관계" : "숙질 (삼촌/고모/이모 ↔ 조카)";

      const isAuntUncleDirect = auntUncle.category !== 'spouse';
      const directAuntUncle = isAuntUncleDirect ? auntUncle : members.find(m => m.id === auntUncle.spouseId);
      
      if (directAuntUncle) {
        if (isAuntUncleDirect) {
          // 직계 고모/이모/삼촌/외삼촌
          if (parentDirect.gender === 'male') {
            // 친가 (아버지 쪽 형제자매)
            if (directAuntUncle.gender === 'male') {
              const isUncleOlderThanFather = isOlderThan(directAuntUncle, parentDirect, members);
              auntUncleTitle = isUncleOlderThanFather ? "큰아버지" : "작은아버지";
            } else {
              auntUncleTitle = "고모";
            }
          } else {
            // 외가 (어머니 쪽 형제자매)
            if (directAuntUncle.gender === 'male') {
              auntUncleTitle = "외삼촌";
            } else {
              auntUncleTitle = "이모";
            }
          }
        } else {
          // 배우자 (숙모, 고모부, 외숙모, 이모부 등)
          if (parentDirect.gender === 'male') {
            // 친가 쪽 배우자
            if (directAuntUncle.gender === 'male') {
              const isUncleOlderThanFather = isOlderThan(directAuntUncle, parentDirect, members);
              auntUncleTitle = isUncleOlderThanFather ? "큰어머니" : "작은어머니";
            } else {
              auntUncleTitle = "고모부";
            }
          } else {
            // 외가 쪽 배우자
            if (directAuntUncle.gender === 'male') {
              auntUncleTitle = "외숙모";
            } else {
              auntUncleTitle = "이모부";
            }
          }
        }
      }

      // If the niece/nephew is a spouse, adjust B calls A with "처"/"시" prefix
      let aCallsB = "";
      let bCallsA = "";
      
      if (isNieceNephewSpouse) {
        // A calls B (sp)
        if (nieceNephew.gender === 'male') {
          aCallsB = `${nieceNephew.name.substring(1)} 서방`;
        } else {
          aCallsB = "새아기";
        }
        
        // B (sp) calls A
        if (nieceNephew.gender === 'male') {
          if (parentDirect.gender === 'male') {
            bCallsA = directAuntUncle.gender === 'male' ? "처삼촌" : "처고모";
          } else {
            bCallsA = directAuntUncle.gender === 'male' ? "처외삼촌" : "처이모";
          }
        } else {
          if (parentDirect.gender === 'male') {
            bCallsA = directAuntUncle.gender === 'male' ? "시삼촌" : "시고모";
          } else {
            bCallsA = directAuntUncle.gender === 'male' ? "시외삼촌" : "시이모";
          }
        }
        
        if (!isAuntUncleDirect) {
          if (parentDirect.gender === 'male') {
            if (directAuntUncle.gender === 'male') {
              bCallsA = nieceNephew.gender === 'male' ? "처숙모" : "시숙모";
            } else {
              bCallsA = nieceNephew.gender === 'male' ? "처고모부" : "시고모부";
            }
          } else {
            if (directAuntUncle.gender === 'male') {
              bCallsA = nieceNephew.gender === 'male' ? "처외숙모" : "시외숙모";
            } else {
              bCallsA = nieceNephew.gender === 'male' ? "처이모부" : "시이모부";
            }
          }
        }
      } else {
        aCallsB = auntUncleTitle;
        bCallsA = getVocative(nieceNephew.name);
      }

      return {
        aCallsB: isAgeneration3 ? aCallsB : bCallsA,
        bCallsA: isAgeneration3 ? bCallsA : aCallsB,
        relation: relationType,
        note: `${directNieceNephew.name}은(는) ${directAuntUncle.name}의 조카입니다.`
      };
    }
  }

  // 4세대 ↔ 3세대 (조카 ↔ 삼촌/이모/고모/당숙/당고모 등 3촌 또는 5촌 관계)
  if ((genA === 'generation4' && genB === 'generation3') || (genA === 'generation3' && genB === 'generation4')) {
    const isAgeneration4 = genA === 'generation4';
    const child = isAgeneration4 ? memberA : memberB;
    const relative = isAgeneration4 ? memberB : memberA;

    // Find parent of child who is direct generation3
    const childParent = members.find(m => child.parentIds && child.parentIds.includes(m.id) && m.category === 'generation3');
    
    if (childParent) {
      const isDirectUncleAunt = childParent.groupId === relative.groupId;
      let honorificTerm = "";
      let relationType = "";
      
      if (isDirectUncleAunt) {
        // 3촌 관계 (삼촌, 고모, 이모, 외삼촌 및 배우자)
        relationType = "이숙질 (삼촌/고모/이모 ↔ 조카)";
        const directRel = relative.category === 'spouse' ? members.find(m => m.id === relative.spouseId) : relative;
        
        if (directRel) {
          if (childParent.gender === 'male') {
            // 친가 (아버지 쪽 형제자매)
            if (directRel.gender === 'male') {
              const isOlderThanFather = isOlderThan(directRel, childParent, members);
              if (relative.category === 'spouse') {
                honorificTerm = isOlderThanFather ? "큰어머니" : "작은어머니";
              } else {
                honorificTerm = isOlderThanFather ? "큰아버지" : "작은아버지";
              }
            } else {
              if (relative.category === 'spouse') {
                honorificTerm = "고모부";
              } else {
                honorificTerm = "고모";
              }
            }
          } else {
            // 외가 (어머니 쪽 형제자매)
            if (directRel.gender === 'male') {
              if (relative.category === 'spouse') {
                honorificTerm = "외숙모";
              } else {
                honorificTerm = "외삼촌";
              }
            } else {
              if (relative.category === 'spouse') {
                honorificTerm = "이모부";
              } else {
                honorificTerm = "이모";
              }
            }
          }
        }
      } else {
        // 5촌 관계 (당숙, 당고모 및 배우자)
        relationType = "오촌 (당숙·당고모 ↔ 조카)";
        const directRel = relative.category === 'spouse' ? members.find(m => m.id === relative.spouseId) : relative;
        if (directRel) {
          if (relative.category === 'spouse') {
            honorificTerm = directRel.gender === 'male' ? "아주머니 (당숙모)" : "아저씨 (당고모부)";
          } else {
            honorificTerm = relative.gender === 'male' ? "아저씨 (당숙)" : "아주머니 (당고모)";
          }
        } else {
          honorificTerm = relative.gender === 'male' ? "아저씨 (당숙)" : "아주머니 (당고모)";
        }
      }

      return {
        aCallsB: isAgeneration4 ? honorificTerm : getVocative(child.name),
        bCallsA: isAgeneration4 ? getVocative(child.name) : honorificTerm,
        relation: relationType,
        note: `3세대와 4세대 간의 친족 관계에 따른 호칭입니다.`
      };
    }
  }

  // 4세대 ↔ 2세대 (조카손주 ↔ 종조부모 ➜ 6촌간 조카손주)
  if ((genA === 'generation4' && genB === 'generation2') || (genA === 'generation2' && genB === 'generation4')) {
    const isAgeneration4 = genA === 'generation4';
    const child = isAgeneration4 ? memberA : memberB;
    const grandUncleAunt = isAgeneration4 ? memberB : memberA;

    const grandTitle = grandUncleAunt.gender === 'male' ? '할아버지 (종조부)' : '할머니 (종조모)';

    if (isAgeneration4) {
      return {
        aCallsB: grandTitle,
        bCallsA: getVocative(child.name),
        relation: "육촌 (종조부모 ↔ 조카손주)",
        note: "할아버지/할머니 항렬의 친척 관계입니다."
      };
    } else {
      return {
        aCallsB: getVocative(child.name),
        bCallsA: grandTitle,
        relation: "육촌 (종조부모 ↔ 조카손주)",
        note: "할아버지/할머니 항렬의 친척 관계입니다."
      };
    }
  }

  // 조부모 ↔ 손자녀 관계 (1세대 ↔ 3세대) 및 증조부모 ↔ 증손자녀 관계 (1세대 ↔ 4세대)
  if ((genA === 'generation1' && (genB === 'generation3' || genB === 'generation4')) || ((genA === 'generation3' || genA === 'generation4') && genB === 'generation1')) {
    const isAgrandparent = genA === 'generation1';
    const grandparent = isAgrandparent ? memberA : memberB;
    const grandchild = isAgrandparent ? memberB : memberA;
    const isG4 = grandchild.category === 'generation4';
    
    const grandTitle = isG4 
      ? (grandparent.gender === 'male' ? '증조할아버지' : '증조할머니')
      : (grandparent.gender === 'male' ? '할아버지' : '할머니');
      
    const relationType = isG4 ? '증조부모 / 증손자녀' : '조부모 / 손자녀';
    const noteText = isG4
      ? `${grandparent.name}은(는) ${grandchild.name}의 증조부모입니다.`
      : `${grandparent.name}은(는) ${grandchild.name}의 조부모입니다.`;
    
    if (isAgrandparent) {
      return {
        aCallsB: getVocative(grandchild.name),
        bCallsA: grandTitle,
        relation: relationType,
        note: noteText
      };
    } else {
      return {
        aCallsB: grandTitle,
        bCallsA: getVocative(grandchild.name),
        relation: relationType,
        note: noteText
      };
    }
  }

  const defaultAcallsB = `${getFirstName(memberB.name)} 님`;
  const defaultBcallsA = `${getFirstName(memberA.name)} 님`;
  return {
    aCallsB: defaultAcallsB,
    bCallsA: defaultBcallsA,
    relation: "가족 (친척)",
    note: "두 구성원 간의 관계 호칭입니다."
  };
}
