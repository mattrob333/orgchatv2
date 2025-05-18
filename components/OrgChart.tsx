'use client';

import { useRef, useState } from 'react';
import { OrgNode } from './OrgNode';

export interface Agent {
  id: string;
  name: string;
  title: string | null;
  department: string | null;
  avatarUrl: string | null;
}

export interface OrgRelationship {
  parentId: string;
  childId: string;
}

interface TreeNode extends Agent {
  children: Array<TreeNode>;
}

function buildTree(agents: Agent[], relationships: OrgRelationship[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  agents.forEach((a) => map.set(a.id, { ...a, children: [] }));
  relationships.forEach((r) => {
    const parent = map.get(r.parentId);
    const child = map.get(r.childId);
    if (parent && child) parent.children.push(child);
  });
  const childrenSet = new Set(relationships.map((r) => r.childId));
  return Array.from(map.values()).filter((n) => !childrenSet.has(n.id));
}

export function OrgChart({
  agents,
  relationships,
}: {
  agents: Agent[];
  relationships: OrgRelationship[];
}) {
  const roots = buildTree(agents, relationships);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => {
      const next = e.deltaY > 0 ? s - 0.1 : s + 0.1;
      return Math.min(Math.max(next, 0.5), 2);
    });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    start.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    setPos({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  };

  const onMouseUp = () => {
    dragging.current = false;
  };

  return (
    <div
      className="w-full h-full overflow-hidden relative bg-background"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        <div className="flex gap-8">
          {roots.map((root) => (
            <TreeNode key={root.id} node={root} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TreeNode({ node }: { node: TreeNode }) {
  return (
    <OrgNode agent={node}>
      {node.children.map((child) => (
        <TreeNode key={child.id} node={child} />
      ))}
    </OrgNode>
  );
}
