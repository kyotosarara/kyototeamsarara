import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import RoleBadge from '@/components/RoleBadge';
import pb from '@/lib/pocketbaseClient';

const UserCard = ({ user, showRole = true, showParticipation = false }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl = user.profile_picture 
    ? pb.files.getUrl(user, user.profile_picture, { thumb: '100x100' })
    : null;

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 rounded-xl">
            <AvatarImage src={avatarUrl} alt={user.name} />
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{user.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
          
          {showRole && (
            <div className="flex-shrink-0">
              <RoleBadge role={user.role} size="sm" />
            </div>
          )}
        </div>
        
        {showParticipation && user.participation_rate !== null && user.participation_rate !== undefined && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">参加率</span>
              <span className="font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {user.participation_rate}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserCard;