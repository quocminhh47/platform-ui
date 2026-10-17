import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { listUsers } from '../api/admin-users.api';
import { adminInstructorsLoadMessage } from '../utils/admin-form-messages';
import { filterEligibleInstructors } from '../utils/eligible-instructors';
import type { User } from '../../auth/types/auth.types';

export type EligibleInstructorsState = {
  instructors: User[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function useEligibleInstructors(enabled: boolean): EligibleInstructorsState {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const [query, setQuery] = useState({ enabled, accessToken, requestId });

  if (
    query.enabled !== enabled ||
    query.accessToken !== accessToken ||
    query.requestId !== requestId
  ) {
    setQuery({ enabled, accessToken, requestId });
    if (!enabled || !accessToken) {
      setLoading(false);
      setError(null);
      setUsers(null);
    } else {
      setLoading(true);
      setError(null);
    }
  }

  const reload = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !accessToken) {
      return;
    }

    let active = true;

    listUsers(accessToken)
      .then((result) => {
        if (!active) {
          return;
        }
        setUsers(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }
        setUsers(null);
        setError(adminInstructorsLoadMessage(cause));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [enabled, accessToken, requestId]);

  const instructors = useMemo(() => {
    if (!users) {
      return [];
    }
    return filterEligibleInstructors(users).sort((a, b) =>
      a.fullName.localeCompare(b.fullName, 'vi'),
    );
  }, [users]);

  return { instructors, loading, error, reload };
}
