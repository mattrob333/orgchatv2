'use client';

import useSWR from 'swr';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { fetcher } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  title: string;
  department: string | null;
  avatarUrl: string | null;
}

interface OrgRelationship {
  parentId: string;
  childId: string;
}

export function OrgChart() {
  const { data } = useSWR<{ agents: Agent[]; relationships: OrgRelationship[] }>(
    '/api/orgchart?limit=200',
    fetcher,
  );
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  function onMouseDown(e: React.MouseEvent) {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  }

  function onMouseUp() {
    dragging.current = false;
  }

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(2, Math.max(0.5, s - e.deltaY * 0.001)));
  };

  if (!data) {
    return <div className="p-4">Loading...</div>;
  }

  const { agents, relationships } = data;
  const map = new Map(agents.map((a) => [a.id, a]));
  const children = new Map<string, string[]>();
  relationships.forEach((r) => {
    if (!children.has(r.parentId)) children.set(r.parentId, []);
    children.get(r.parentId)!.push(r.childId);
  });
  const rootAgents = agents.filter(
    (a) => !relationships.some((r) => r.childId === a.id),
  );

  const renderNode = (id: string) => {
    const a = map.get(id);
    if (!a) return null;
    const childIds = children.get(id) || [];
    return (
      <div key={id} className="ml-4 mt-4">
        <div className="relative group bg-muted rounded-md p-2 shadow-sm w-48">
          {a.avatarUrl && (
            <img
              src={a.avatarUrl}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="font-semibold">{a.name}</div>
          <div className="text-sm text-muted-foreground">{a.title}</div>
          {a.department && (
            <div className="text-xs text-muted-foreground">{a.department}</div>
          )}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">
            <Link href={`/chat?agentId=${a.id}`}>
              <Button size="sm" variant="ghost">
                Chat
              </Button>
            </Link>
            <Link href={`/admin/agents/${a.id}`}>
              <Button size="sm" variant="ghost">
                Settings
              </Button>
            </Link>
          </div>
        </div>
        <div className="ml-8">
          {childIds.map((cid) => renderNode(cid))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden flex-1 select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
    >
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        }}
      >
        {rootAgents.map((a) => renderNode(a.id))}
      </div>
      <div className="absolute top-2 right-2 flex gap-2 bg-background p-1 rounded-md shadow">
        <Button size="sm" onClick={() => setScale((s) => Math.min(2, s * 1.2))}>
          +
        </Button>
        <Button size="sm" onClick={() => setScale((s) => Math.max(0.5, s / 1.2))}>
          -
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setScale(1);
            setOffset({ x: 0, y: 0 });
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
