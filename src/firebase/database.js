import { ref, set, push, update, remove, onValue, serverTimestamp } from "firebase/database";
import { database, auth } from "./config.js";

// ==========================================
// MEMBERS
// ==========================================
export function onMembersChange(callback) {
  const membersRef = ref(database, 'members');
  return onValue(membersRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || {});
  });
}

// Lắng nghe trạng thái online/offline của user hiện tại
export function setupPresence() {
  const connectedRef = ref(database, '.info/connected');
  onValue(connectedRef, (snap) => {
    if (snap.val() === true && auth.currentUser) {
      const userRef = ref(database, `members/${auth.currentUser.uid}/isOnline`);
      set(userRef, true);
    }
  });
}

export async function deleteMember(uid) {
  const memberRef = ref(database, `members/${uid}`);
  await remove(memberRef);
}

// ==========================================
// SCHEDULE
// ==========================================
export function onScheduleChange(callback) {
  const scheduleRef = ref(database, 'schedule');
  return onValue(scheduleRef, (snapshot) => {
    const data = snapshot.val() || {};
    // Convert to array and sort by startTime
    const list = Object.entries(data).map(([id, item]) => ({ id, ...item }));
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    callback(list);
  });
}

export async function addScheduleItem(item) {
  const scheduleRef = ref(database, 'schedule');
  const newItemRef = push(scheduleRef);
  await set(newItemRef, {
    ...item,
    createdBy: auth.currentUser?.uid,
    createdAt: serverTimestamp()
  });
}

export async function updateScheduleItem(id, updates) {
  const itemRef = ref(database, `schedule/${id}`);
  await update(itemRef, updates);
}

export async function deleteScheduleItem(id) {
  const itemRef = ref(database, `schedule/${id}`);
  await remove(itemRef);
}

// ==========================================
// CHECKLIST
// ==========================================
export function onChecklistChange(callback) {
  const checklistRef = ref(database, 'checklist');
  return onValue(checklistRef, (snapshot) => {
    const data = snapshot.val() || {};
    const list = Object.entries(data).map(([id, item]) => ({ id, ...item }));
    callback(list);
  });
}

export async function addChecklistItem(item) {
  const checklistRef = ref(database, 'checklist');
  const newItemRef = push(checklistRef);
  await set(newItemRef, {
    ...item,
    completed: false,
    completedBy: null,
    completedAt: null,
    createdBy: auth.currentUser?.uid,
    createdAt: serverTimestamp()
  });
}

export async function toggleChecklistItem(id, currentStatus) {
  const itemRef = ref(database, `checklist/${id}`);
  await update(itemRef, {
    completed: !currentStatus,
    completedBy: !currentStatus ? auth.currentUser?.uid : null,
    completedAt: !currentStatus ? serverTimestamp() : null
  });
}

export async function assignChecklistItem(id, memberId) {
  const itemRef = ref(database, `checklist/${id}`);
  await update(itemRef, { assignedTo: memberId });
}

export async function deleteChecklistItem(id) {
  const itemRef = ref(database, `checklist/${id}`);
  await remove(itemRef);
}

// ==========================================
// POLLS
// ==========================================
export function onPollsChange(callback) {
  const pollsRef = ref(database, 'polls');
  return onValue(pollsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const list = Object.entries(data).map(([id, item]) => ({ id, ...item }));
    // Sort by createdAt descending
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    callback(list);
  });
}

export async function addPoll(pollData) {
  const pollsRef = ref(database, 'polls');
  const newPollRef = push(pollsRef);
  await set(newPollRef, {
    ...pollData,
    status: 'open',
    createdBy: auth.currentUser?.uid,
    createdAt: serverTimestamp()
  });
}

export async function deletePoll(id) {
  const pollRef = ref(database, `polls/${id}`);
  await remove(pollRef);
}

export async function votePoll(pollId, optionKey, allowMultiple, pollOptionsCount) {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  
  // Create an updates object to apply multiple writes atomically
  const updates = {};
  
  // If not allow multiple, we must remove votes from other options first
  if (!allowMultiple && pollOptionsCount > 0) {
    for (let i = 0; i < pollOptionsCount; i++) {
      if (i !== optionKey) {
        updates[`polls/${pollId}/votes/${i}/${uid}`] = null;
      }
    }
  }
  
  // Ghi nhận lá phiếu mới cho phương án hiện tại
  updates[`polls/${pollId}/votes/${optionKey}/${uid}`] = true;
  
  await update(ref(database), updates);
}

export async function removeVote(pollId, optionKey) {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  const voteRef = ref(database, `polls/${pollId}/votes/${optionKey}/${uid}`);
  await remove(voteRef);
}

export async function closePoll(pollId) {
  const pollRef = ref(database, `polls/${pollId}`);
  await update(pollRef, { status: 'closed' });
}

// ==========================================
// EXPENSES (V1)
// ==========================================
export function onExpensesChange(callback) {
  const expensesRef = ref(database, 'expenses');
  return onValue(expensesRef, (snapshot) => {
    const data = snapshot.val() || {};
    const list = Object.entries(data).map(([id, item]) => ({ id, ...item }));
    // Sort by createdAt descending
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    callback(list);
  });
}

export async function addExpense(expense) {
  const expensesRef = ref(database, 'expenses');
  const newExpenseRef = push(expensesRef);
  await set(newExpenseRef, {
    ...expense,
    createdBy: auth.currentUser?.uid,
    createdAt: serverTimestamp()
  });
}

export async function deleteExpense(id) {
  const expenseRef = ref(database, `expenses/${id}`);
  await remove(expenseRef);
}
