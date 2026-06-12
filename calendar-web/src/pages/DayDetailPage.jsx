import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getEntryDetail, saveComment } from '../api/entries.js';
import { deleteImage, updateFit, uploadImage } from '../api/image.js';
import { addTodo, deleteTodo, reorderTodos, updateTodo } from '../api/todos.js';
import { ArrowLeft, Check, Grip, Note, Photo, Plus, Trash } from '../components/icons.jsx';
import { WEEKDAYS_FULL } from '../lib/calendar.js';
import './DayDetailPage.css';

function TodoRow({ todo, editing, editingText, onEditStart, onEditChange, onEditCommit, onToggle, onDelete, onGripDown, dragging }) {
  return (
    <div className={'todo' + (todo.isDone ? ' done' : '') + (dragging ? ' dragging' : '')} data-tid={todo.id}>
      <span className="grip" onPointerDown={(e) => onGripDown(e, todo.id)}>
        <Grip />
      </span>
      <span className="cbox" onClick={() => onToggle(todo)}>
        <Check />
      </span>
      {editing ? (
        <input
          className="tedit"
          value={editingText}
          autoFocus
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={() => onEditCommit(todo)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEditCommit(todo);
            if (e.key === 'Escape') onEditCommit(todo, true);
          }}
        />
      ) : (
        <span className="ttxt" onClick={() => onEditStart(todo)} title="클릭하여 수정">
          {todo.content}
        </span>
      )}
      <button className="del" onClick={() => onDelete(todo.id)} aria-label="삭제">
        <Trash />
      </button>
    </div>
  );
}

export default function DayDetailPage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [y, mo, d] = date.split('-').map(Number);
  const weekday = new Date(y, mo - 1, d).getDay();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  const [comment, setComment] = useState('');
  const [savedComment, setSavedComment] = useState('');
  const [commentStatus, setCommentStatus] = useState(''); // '' | 'saving' | 'saved'

  const [image, setImage] = useState(null);
  const [todos, setTodos] = useState([]);
  const [draft, setDraft] = useState('');
  const [dragId, setDragId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const listRef = useRef(null);
  const fileRef = useRef(null);
  const todosRef = useRef(todos);
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getEntryDetail(date);
        if (cancelled) return;
        setComment(data.comment ?? '');
        setSavedComment(data.comment ?? '');
        setImage(data.image ?? null);
        setTodos(data.todos ?? []);
      } catch {
        if (!cancelled) setError('불러오지 못했어요.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const fail = (msg = '변경 사항을 저장하지 못했어요.') => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 2200);
  };

  // ----- 코멘트 -----
  const commitComment = async () => {
    if (comment === savedComment) return;
    setCommentStatus('saving');
    try {
      await saveComment(date, comment);
      setSavedComment(comment);
      setCommentStatus('saved');
      setTimeout(() => setCommentStatus(''), 1500);
    } catch {
      setCommentStatus('');
      fail();
    }
  };

  // ----- 투두 -----
  const addTodoItem = async () => {
    const text = draft.trim();
    if (!text) return;
    try {
      const created = await addTodo(date, text);
      setTodos((prev) => [...prev, created]);
      setDraft('');
    } catch {
      fail();
    }
  };
  const toggle = async (todo) => {
    try {
      const updated = await updateTodo(todo.id, { isDone: !todo.isDone });
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch {
      fail();
    }
  };
  const removeTodo = async (id) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      fail();
    }
  };
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.content);
  };
  const commitEdit = async (todo, cancel = false) => {
    const text = editingText.trim();
    setEditingId(null);
    if (cancel || !text || text === todo.content) return;
    try {
      const updated = await updateTodo(todo.id, { content: text });
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch {
      fail();
    }
  };

  // pointer 기반 드래그 재정렬: 이동 중엔 transform으로만 시각 이동, 드롭 시 PUT order로 확정
  const onGripDown = (ev, id) => {
    ev.preventDefault();
    const rows = [...listRef.current.querySelectorAll('.todo')];
    const from = rows.findIndex((r) => String(r.dataset.tid) === String(id));
    if (from === -1) return;
    const rects = rows.map((r) => r.getBoundingClientRect());
    const gap = rows.length > 1 ? rects[1].top - rects[0].bottom : 0;
    const shift = rects[from].height + gap;
    const startY = ev.clientY;
    let to = from;
    setDragId(id);

    const move = (mv) => {
      const dy = mv.clientY - startY;
      rows[from].style.transform = `translateY(${dy}px)`;
      const centerY = rects[from].top + rects[from].height / 2 + dy;
      to = 0;
      for (let i = 0; i < rows.length; i++) {
        if (i !== from && centerY > rects[i].top + rects[i].height / 2) to += 1;
      }
      for (let i = 0; i < rows.length; i++) {
        if (i === from) continue;
        if (i > from && i <= to) rows[i].style.transform = `translateY(${-shift}px)`;
        else if (i < from && i >= to) rows[i].style.transform = `translateY(${shift}px)`;
        else rows[i].style.transform = '';
      }
    };
    const up = async () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      // transform 제거와 DOM 재배치가 같은 프레임에 일어나도록 transition을 잠시 끈다
      rows.forEach((r) => {
        r.style.transition = 'none';
        r.style.transform = '';
      });
      requestAnimationFrame(() => rows.forEach((r) => (r.style.transition = '')));
      setDragId(null);
      if (to === from) return;
      const cur = todosRef.current.slice();
      const [moved] = cur.splice(from, 1);
      cur.splice(to, 0, moved);
      setTodos(cur);
      try {
        const ordered = await reorderTodos(
          date,
          cur.map((t) => t.id),
        );
        setTodos(ordered);
      } catch {
        fail('순서를 저장하지 못했어요.');
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  // ----- 사진 -----
  const pickFile = () => fileRef.current?.click();
  const onFile = async (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    try {
      const img = await uploadImage(date, file, image?.fit || 'cover');
      setImage(img);
    } catch (err) {
      fail(err?.response?.data?.message || '사진 업로드에 실패했어요.');
    }
  };
  const changeFit = async (fit) => {
    if (!image || image.fit === fit) return;
    try {
      const img = await updateFit(date, fit);
      setImage(img);
    } catch {
      fail();
    }
  };
  const removePhoto = async () => {
    try {
      await deleteImage(date);
      setImage(null);
    } catch {
      fail();
    }
  };

  const ym = `${y}. ${String(mo).padStart(2, '0')}`;
  const hasPhoto = !!image;

  if (loading) {
    return <div className="route-loading">불러오는 중…</div>;
  }

  return (
    <div className="dt-scroll">
      <div className="dt-wrap">
        {(error || flash) && <div className="dt-flash">{error || flash}</div>}
        <div className="dt-grid">
          <div className="dt-left">
            <div className={'banner' + (hasPhoto ? '' : ' empty')}>
              {hasPhoto && (
                <img
                  className="bimg"
                  src={image.imageUrl}
                  alt=""
                  style={{ objectFit: image.fit === 'contain' ? 'contain' : 'cover' }}
                />
              )}
              {hasPhoto && <div className="bshade" />}
              {!hasPhoto && (
                <div className="empty-hint">
                  <Photo />
                  <span>사진을 추가해 보세요</span>
                </div>
              )}
              <button className="back-btn" onClick={() => navigate('/?m=' + date.slice(0, 7))} aria-label="뒤로">
                <ArrowLeft />
              </button>
              <div className="b-date">
                <div className="ym">{ym}</div>
                <div className="dl">
                  <span className="d serif">{d}</span>
                  <span className="w serif">{WEEKDAYS_FULL[weekday]}</span>
                </div>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg"
              hidden
              onChange={onFile}
            />
            <div className="act-row">
              <button className="btn primary" onClick={pickFile}>
                <Photo />
                {hasPhoto ? '사진 변경' : '사진 추가'}
              </button>
              {hasPhoto && (
                <button className="btn ghost" onClick={removePhoto}>
                  사진 삭제
                </button>
              )}
            </div>

            {hasPhoto && (
              <div className="radio-row">
                {[
                  ['cover', '꽉 채우기'],
                  ['contain', '비율 유지'],
                ].map(([v, l]) => (
                  <div
                    key={v}
                    className={'radio' + (image.fit === v ? ' on' : '')}
                    onClick={() => changeFit(v)}
                  >
                    <span className="dot" />
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dt-right">
            <div className="field-label">
              <Note />
              오늘의 기분 · 메모
              {commentStatus === 'saving' && <span className="save-stat">저장 중…</span>}
              {commentStatus === 'saved' && <span className="save-stat ok">저장됨</span>}
            </div>
            <textarea
              className="memo-box"
              value={comment}
              placeholder="오늘 하루는 어땠나요?"
              onChange={(e) => setComment(e.target.value)}
              onBlur={commitComment}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) commitComment();
              }}
            />

            <div className="field-label">
              <Check />할 일
            </div>
            <div className="todo-add">
              <input
                value={draft}
                placeholder="할 일을 입력하고 Enter"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTodoItem();
                }}
              />
              <button onClick={addTodoItem} aria-label="추가">
                <Plus />
              </button>
            </div>
            {todos.length === 0 ? (
              <div className="todo-empty">아직 할 일이 없어요</div>
            ) : (
              <div className="todo-list" ref={listRef}>
                {todos.map((t) => (
                  <TodoRow
                    key={t.id}
                    todo={t}
                    editing={editingId === t.id}
                    editingText={editingText}
                    onEditStart={startEdit}
                    onEditChange={setEditingText}
                    onEditCommit={commitEdit}
                    onToggle={toggle}
                    onDelete={removeTodo}
                    onGripDown={onGripDown}
                    dragging={dragId === t.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
