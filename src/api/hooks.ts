import { useCallback, useEffect, useState } from "react";

export type InvokeResponse<TResponse, TError> =
  | {
      loading: true;
      data: null;
      error: null;
    }
  | {
      loading: false;
      data: TResponse;
      error: null;
    }
  | {
      loading: false;
      data: null;
      error: TError;
    };

export type InvokeQueryResponse<TResponse, TError> = InvokeResponse<
  TResponse,
  TError
> & {
  invalidate: () => Promise<void>;
};

export const useInvokeQuery = <TResponse = unknown, TError = Error>(
  query: () => Promise<TResponse>,
) => {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    query()
      .then((response) => {
        setData(response);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]);
  const invalidate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await query();
      setData(response);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [query]);
  return {
    loading,
    data,
    error,
    invalidate,
  } as InvokeQueryResponse<TResponse, TError>;
};

type MutateResponse<TInput, TResponse, TError> = InvokeResponse<
  TResponse,
  TError
> & {
  mutate: (input: TInput) => Promise<void>;
};

export const useInvokeMutation = <
  TInput = unknown,
  TResponse = unknown,
  TError = Error,
>(
  mutation: (input: TInput) => Promise<TResponse>,
) => {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const mutate = useCallback(
    async (input: TInput) => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const response = await mutation(input);
        setData(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [mutation],
  );

  return {
    mutate,
    loading,
    data,
    error,
  } as MutateResponse<TInput, TResponse, TError>;
};
