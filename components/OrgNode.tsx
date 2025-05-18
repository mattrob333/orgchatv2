'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export interface OrgNodeProps {
  agent: {
    id: string;
    name: string;
    title: string | null;
    department: string | null;
    avatarUrl: string | null;
  };
  children?: React.ReactNode;
}

export function OrgNode({ agent, children }: OrgNodeProps) {
  const [hover, setHover] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative group p-2 bg-card border rounded-md text-center"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {agent.avatarUrl && (
          <Image
            src={agent.avatarUrl}
            alt={agent.name}
            width={48}
            height={48}
            className="rounded-full mx-auto mb-1"
          />
        )}
        <div className="text-sm font-medium">{agent.name}</div>
        {agent.title && (
          <div className="text-xs text-muted-foreground">{agent.title}</div>
        )}
        {agent.department && (
          <div className="text-xs text-muted-foreground">{agent.department}</div>
        )}
        <div
          className={`absolute -top-1 right-0 flex gap-1 ${hover ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        >
          <Link
            href={`/chat?agentId=${agent.id}`}
            className="text-xs bg-primary text-primary-foreground rounded px-1"
          >
            Chat
          </Link>
          <Link
            href={`/admin/agents/${agent.id}`}
            className="text-xs bg-muted rounded px-1"
          >
            Settings
          </Link>
        </div>
      </div>
      {children && <div className="mt-4 flex gap-4">{children}</div>}
    </div>
  );
}
