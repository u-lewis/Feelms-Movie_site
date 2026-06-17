import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Ad, AdImpression, AdImpressionInput, AdInput, AdUpdate, AuthResponse, Banner, BannerInput, BannerUpdate, DashboardStats, GetAdsParams, GetBannersParams, GetMoviesParams, GetSectionsParams, HealthStatus, Interpreter, InterpreterInput, InterpreterUpdate, LoginInput, Movie, MovieInput, MovieUpdate, Payment, PaymentInitResponse, PaymentInput, PaymentVerifyInput, PaymentVerifyResponse, RegisterInput, RoleUpdate, Section, SectionInput, SectionUpdate, User, WatchHistoryEntry } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRegisterUrl: () => string;
/**
 * @summary Register a new user
 */
export declare const register: (registerInput: RegisterInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getRegisterMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = BodyType<RegisterInput>;
export type RegisterMutationError = ErrorType<void>;
/**
* @summary Register a new user
*/
export declare const useRegister: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export declare const getLoginUrl: () => string;
/**
 * @summary Login
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<void>;
/**
* @summary Login
*/
export declare const useLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current user
 */
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<void>;
/**
 * @summary Get current user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMoviesUrl: (params?: GetMoviesParams) => string;
/**
 * @summary List movies with optional filters
 */
export declare const getMovies: (params?: GetMoviesParams, options?: RequestInit) => Promise<Movie[]>;
export declare const getGetMoviesQueryKey: (params?: GetMoviesParams) => readonly ["/api/movies", ...GetMoviesParams[]];
export declare const getGetMoviesQueryOptions: <TData = Awaited<ReturnType<typeof getMovies>>, TError = ErrorType<unknown>>(params?: GetMoviesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMovies>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMovies>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMoviesQueryResult = NonNullable<Awaited<ReturnType<typeof getMovies>>>;
export type GetMoviesQueryError = ErrorType<unknown>;
/**
 * @summary List movies with optional filters
 */
export declare function useGetMovies<TData = Awaited<ReturnType<typeof getMovies>>, TError = ErrorType<unknown>>(params?: GetMoviesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMovies>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateMovieUrl: () => string;
/**
 * @summary Create a movie (admin only)
 */
export declare const createMovie: (movieInput: MovieInput, options?: RequestInit) => Promise<Movie>;
export declare const getCreateMovieMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMovie>>, TError, {
        data: BodyType<MovieInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createMovie>>, TError, {
    data: BodyType<MovieInput>;
}, TContext>;
export type CreateMovieMutationResult = NonNullable<Awaited<ReturnType<typeof createMovie>>>;
export type CreateMovieMutationBody = BodyType<MovieInput>;
export type CreateMovieMutationError = ErrorType<unknown>;
/**
* @summary Create a movie (admin only)
*/
export declare const useCreateMovie: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMovie>>, TError, {
        data: BodyType<MovieInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createMovie>>, TError, {
    data: BodyType<MovieInput>;
}, TContext>;
export declare const getGetTrendingMoviesUrl: () => string;
/**
 * @summary Get trending movies
 */
export declare const getTrendingMovies: (options?: RequestInit) => Promise<Movie[]>;
export declare const getGetTrendingMoviesQueryKey: () => readonly ["/api/movies/trending"];
export declare const getGetTrendingMoviesQueryOptions: <TData = Awaited<ReturnType<typeof getTrendingMovies>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrendingMovies>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTrendingMovies>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTrendingMoviesQueryResult = NonNullable<Awaited<ReturnType<typeof getTrendingMovies>>>;
export type GetTrendingMoviesQueryError = ErrorType<unknown>;
/**
 * @summary Get trending movies
 */
export declare function useGetTrendingMovies<TData = Awaited<ReturnType<typeof getTrendingMovies>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrendingMovies>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetNewReleasesUrl: () => string;
/**
 * @summary Get new release movies
 */
export declare const getNewReleases: (options?: RequestInit) => Promise<Movie[]>;
export declare const getGetNewReleasesQueryKey: () => readonly ["/api/movies/new-releases"];
export declare const getGetNewReleasesQueryOptions: <TData = Awaited<ReturnType<typeof getNewReleases>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getNewReleases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getNewReleases>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetNewReleasesQueryResult = NonNullable<Awaited<ReturnType<typeof getNewReleases>>>;
export type GetNewReleasesQueryError = ErrorType<unknown>;
/**
 * @summary Get new release movies
 */
export declare function useGetNewReleases<TData = Awaited<ReturnType<typeof getNewReleases>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getNewReleases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetVipExclusivesUrl: () => string;
/**
 * @summary Get VIP exclusive movies
 */
export declare const getVipExclusives: (options?: RequestInit) => Promise<Movie[]>;
export declare const getGetVipExclusivesQueryKey: () => readonly ["/api/movies/vip-exclusives"];
export declare const getGetVipExclusivesQueryOptions: <TData = Awaited<ReturnType<typeof getVipExclusives>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVipExclusives>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getVipExclusives>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetVipExclusivesQueryResult = NonNullable<Awaited<ReturnType<typeof getVipExclusives>>>;
export type GetVipExclusivesQueryError = ErrorType<unknown>;
/**
 * @summary Get VIP exclusive movies
 */
export declare function useGetVipExclusives<TData = Awaited<ReturnType<typeof getVipExclusives>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVipExclusives>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMovieUrl: (id: number) => string;
/**
 * @summary Get single movie
 */
export declare const getMovie: (id: number, options?: RequestInit) => Promise<Movie>;
export declare const getGetMovieQueryKey: (id: number) => readonly [`/api/movies/${number}`];
export declare const getGetMovieQueryOptions: <TData = Awaited<ReturnType<typeof getMovie>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMovie>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMovie>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMovieQueryResult = NonNullable<Awaited<ReturnType<typeof getMovie>>>;
export type GetMovieQueryError = ErrorType<void>;
/**
 * @summary Get single movie
 */
export declare function useGetMovie<TData = Awaited<ReturnType<typeof getMovie>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMovie>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateMovieUrl: (id: number) => string;
/**
 * @summary Update a movie (admin only)
 */
export declare const updateMovie: (id: number, movieUpdate: MovieUpdate, options?: RequestInit) => Promise<Movie>;
export declare const getUpdateMovieMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMovie>>, TError, {
        id: number;
        data: BodyType<MovieUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMovie>>, TError, {
    id: number;
    data: BodyType<MovieUpdate>;
}, TContext>;
export type UpdateMovieMutationResult = NonNullable<Awaited<ReturnType<typeof updateMovie>>>;
export type UpdateMovieMutationBody = BodyType<MovieUpdate>;
export type UpdateMovieMutationError = ErrorType<unknown>;
/**
* @summary Update a movie (admin only)
*/
export declare const useUpdateMovie: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMovie>>, TError, {
        id: number;
        data: BodyType<MovieUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMovie>>, TError, {
    id: number;
    data: BodyType<MovieUpdate>;
}, TContext>;
export declare const getDeleteMovieUrl: (id: number) => string;
/**
 * @summary Delete a movie (admin only)
 */
export declare const deleteMovie: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteMovieMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMovie>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteMovie>>, TError, {
    id: number;
}, TContext>;
export type DeleteMovieMutationResult = NonNullable<Awaited<ReturnType<typeof deleteMovie>>>;
export type DeleteMovieMutationError = ErrorType<unknown>;
/**
* @summary Delete a movie (admin only)
*/
export declare const useDeleteMovie: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteMovie>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteMovie>>, TError, {
    id: number;
}, TContext>;
export declare const getRecordWatchUrl: (id: number) => string;
/**
 * @summary Record a watch history entry
 */
export declare const recordWatch: (id: number, options?: RequestInit) => Promise<WatchHistoryEntry>;
export declare const getRecordWatchMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof recordWatch>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof recordWatch>>, TError, {
    id: number;
}, TContext>;
export type RecordWatchMutationResult = NonNullable<Awaited<ReturnType<typeof recordWatch>>>;
export type RecordWatchMutationError = ErrorType<unknown>;
/**
* @summary Record a watch history entry
*/
export declare const useRecordWatch: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof recordWatch>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof recordWatch>>, TError, {
    id: number;
}, TContext>;
export declare const getGetInterpretersUrl: () => string;
/**
 * @summary List all interpreters
 */
export declare const getInterpreters: (options?: RequestInit) => Promise<Interpreter[]>;
export declare const getGetInterpretersQueryKey: () => readonly ["/api/interpreters"];
export declare const getGetInterpretersQueryOptions: <TData = Awaited<ReturnType<typeof getInterpreters>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInterpreters>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getInterpreters>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetInterpretersQueryResult = NonNullable<Awaited<ReturnType<typeof getInterpreters>>>;
export type GetInterpretersQueryError = ErrorType<unknown>;
/**
 * @summary List all interpreters
 */
export declare function useGetInterpreters<TData = Awaited<ReturnType<typeof getInterpreters>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInterpreters>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateInterpreterUrl: () => string;
/**
 * @summary Create an interpreter (admin only)
 */
export declare const createInterpreter: (interpreterInput: InterpreterInput, options?: RequestInit) => Promise<Interpreter>;
export declare const getCreateInterpreterMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createInterpreter>>, TError, {
        data: BodyType<InterpreterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createInterpreter>>, TError, {
    data: BodyType<InterpreterInput>;
}, TContext>;
export type CreateInterpreterMutationResult = NonNullable<Awaited<ReturnType<typeof createInterpreter>>>;
export type CreateInterpreterMutationBody = BodyType<InterpreterInput>;
export type CreateInterpreterMutationError = ErrorType<unknown>;
/**
* @summary Create an interpreter (admin only)
*/
export declare const useCreateInterpreter: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createInterpreter>>, TError, {
        data: BodyType<InterpreterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createInterpreter>>, TError, {
    data: BodyType<InterpreterInput>;
}, TContext>;
export declare const getUpdateInterpreterUrl: (id: number) => string;
/**
 * @summary Update an interpreter (admin only)
 */
export declare const updateInterpreter: (id: number, interpreterUpdate: InterpreterUpdate, options?: RequestInit) => Promise<Interpreter>;
export declare const getUpdateInterpreterMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateInterpreter>>, TError, {
        id: number;
        data: BodyType<InterpreterUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateInterpreter>>, TError, {
    id: number;
    data: BodyType<InterpreterUpdate>;
}, TContext>;
export type UpdateInterpreterMutationResult = NonNullable<Awaited<ReturnType<typeof updateInterpreter>>>;
export type UpdateInterpreterMutationBody = BodyType<InterpreterUpdate>;
export type UpdateInterpreterMutationError = ErrorType<unknown>;
/**
* @summary Update an interpreter (admin only)
*/
export declare const useUpdateInterpreter: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateInterpreter>>, TError, {
        id: number;
        data: BodyType<InterpreterUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateInterpreter>>, TError, {
    id: number;
    data: BodyType<InterpreterUpdate>;
}, TContext>;
export declare const getDeleteInterpreterUrl: (id: number) => string;
/**
 * @summary Delete an interpreter (admin only)
 */
export declare const deleteInterpreter: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteInterpreterMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteInterpreter>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteInterpreter>>, TError, {
    id: number;
}, TContext>;
export type DeleteInterpreterMutationResult = NonNullable<Awaited<ReturnType<typeof deleteInterpreter>>>;
export type DeleteInterpreterMutationError = ErrorType<unknown>;
/**
* @summary Delete an interpreter (admin only)
*/
export declare const useDeleteInterpreter: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteInterpreter>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteInterpreter>>, TError, {
    id: number;
}, TContext>;
export declare const getGetBannersUrl: (params?: GetBannersParams) => string;
/**
 * @summary List active banners
 */
export declare const getBanners: (params?: GetBannersParams, options?: RequestInit) => Promise<Banner[]>;
export declare const getGetBannersQueryKey: (params?: GetBannersParams) => readonly ["/api/banners", ...GetBannersParams[]];
export declare const getGetBannersQueryOptions: <TData = Awaited<ReturnType<typeof getBanners>>, TError = ErrorType<unknown>>(params?: GetBannersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBanners>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBanners>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBannersQueryResult = NonNullable<Awaited<ReturnType<typeof getBanners>>>;
export type GetBannersQueryError = ErrorType<unknown>;
/**
 * @summary List active banners
 */
export declare function useGetBanners<TData = Awaited<ReturnType<typeof getBanners>>, TError = ErrorType<unknown>>(params?: GetBannersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBanners>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateBannerUrl: () => string;
/**
 * @summary Create a banner (admin only)
 */
export declare const createBanner: (bannerInput: BannerInput, options?: RequestInit) => Promise<Banner>;
export declare const getCreateBannerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBanner>>, TError, {
        data: BodyType<BannerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createBanner>>, TError, {
    data: BodyType<BannerInput>;
}, TContext>;
export type CreateBannerMutationResult = NonNullable<Awaited<ReturnType<typeof createBanner>>>;
export type CreateBannerMutationBody = BodyType<BannerInput>;
export type CreateBannerMutationError = ErrorType<unknown>;
/**
* @summary Create a banner (admin only)
*/
export declare const useCreateBanner: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBanner>>, TError, {
        data: BodyType<BannerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createBanner>>, TError, {
    data: BodyType<BannerInput>;
}, TContext>;
export declare const getUpdateBannerUrl: (id: number) => string;
/**
 * @summary Update a banner (admin only)
 */
export declare const updateBanner: (id: number, bannerUpdate: BannerUpdate, options?: RequestInit) => Promise<Banner>;
export declare const getUpdateBannerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBanner>>, TError, {
        id: number;
        data: BodyType<BannerUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateBanner>>, TError, {
    id: number;
    data: BodyType<BannerUpdate>;
}, TContext>;
export type UpdateBannerMutationResult = NonNullable<Awaited<ReturnType<typeof updateBanner>>>;
export type UpdateBannerMutationBody = BodyType<BannerUpdate>;
export type UpdateBannerMutationError = ErrorType<unknown>;
/**
* @summary Update a banner (admin only)
*/
export declare const useUpdateBanner: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBanner>>, TError, {
        id: number;
        data: BodyType<BannerUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateBanner>>, TError, {
    id: number;
    data: BodyType<BannerUpdate>;
}, TContext>;
export declare const getDeleteBannerUrl: (id: number) => string;
/**
 * @summary Delete a banner (admin only)
 */
export declare const deleteBanner: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteBannerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBanner>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteBanner>>, TError, {
    id: number;
}, TContext>;
export type DeleteBannerMutationResult = NonNullable<Awaited<ReturnType<typeof deleteBanner>>>;
export type DeleteBannerMutationError = ErrorType<unknown>;
/**
* @summary Delete a banner (admin only)
*/
export declare const useDeleteBanner: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBanner>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteBanner>>, TError, {
    id: number;
}, TContext>;
export declare const getGetSectionsUrl: (params?: GetSectionsParams) => string;
/**
 * @summary List homepage sections
 */
export declare const getSections: (params?: GetSectionsParams, options?: RequestInit) => Promise<Section[]>;
export declare const getGetSectionsQueryKey: (params?: GetSectionsParams) => readonly ["/api/sections", ...GetSectionsParams[]];
export declare const getGetSectionsQueryOptions: <TData = Awaited<ReturnType<typeof getSections>>, TError = ErrorType<unknown>>(params?: GetSectionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSections>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSections>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSectionsQueryResult = NonNullable<Awaited<ReturnType<typeof getSections>>>;
export type GetSectionsQueryError = ErrorType<unknown>;
/**
 * @summary List homepage sections
 */
export declare function useGetSections<TData = Awaited<ReturnType<typeof getSections>>, TError = ErrorType<unknown>>(params?: GetSectionsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSections>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateSectionUrl: () => string;
/**
 * @summary Create a section (admin only)
 */
export declare const createSection: (sectionInput: SectionInput, options?: RequestInit) => Promise<Section>;
export declare const getCreateSectionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSection>>, TError, {
        data: BodyType<SectionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createSection>>, TError, {
    data: BodyType<SectionInput>;
}, TContext>;
export type CreateSectionMutationResult = NonNullable<Awaited<ReturnType<typeof createSection>>>;
export type CreateSectionMutationBody = BodyType<SectionInput>;
export type CreateSectionMutationError = ErrorType<unknown>;
/**
* @summary Create a section (admin only)
*/
export declare const useCreateSection: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSection>>, TError, {
        data: BodyType<SectionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createSection>>, TError, {
    data: BodyType<SectionInput>;
}, TContext>;
export declare const getUpdateSectionUrl: (id: number) => string;
/**
 * @summary Update a section (admin only)
 */
export declare const updateSection: (id: number, sectionUpdate: SectionUpdate, options?: RequestInit) => Promise<Section>;
export declare const getUpdateSectionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSection>>, TError, {
        id: number;
        data: BodyType<SectionUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSection>>, TError, {
    id: number;
    data: BodyType<SectionUpdate>;
}, TContext>;
export type UpdateSectionMutationResult = NonNullable<Awaited<ReturnType<typeof updateSection>>>;
export type UpdateSectionMutationBody = BodyType<SectionUpdate>;
export type UpdateSectionMutationError = ErrorType<unknown>;
/**
* @summary Update a section (admin only)
*/
export declare const useUpdateSection: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSection>>, TError, {
        id: number;
        data: BodyType<SectionUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSection>>, TError, {
    id: number;
    data: BodyType<SectionUpdate>;
}, TContext>;
export declare const getDeleteSectionUrl: (id: number) => string;
/**
 * @summary Delete a section (admin only)
 */
export declare const deleteSection: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteSectionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteSection>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteSection>>, TError, {
    id: number;
}, TContext>;
export type DeleteSectionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteSection>>>;
export type DeleteSectionMutationError = ErrorType<unknown>;
/**
* @summary Delete a section (admin only)
*/
export declare const useDeleteSection: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteSection>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteSection>>, TError, {
    id: number;
}, TContext>;
export declare const getGetUsersUrl: () => string;
/**
 * @summary List all users (admin only)
 */
export declare const getUsers: (options?: RequestInit) => Promise<User[]>;
export declare const getGetUsersQueryKey: () => readonly ["/api/users"];
export declare const getGetUsersQueryOptions: <TData = Awaited<ReturnType<typeof getUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUsersQueryResult = NonNullable<Awaited<ReturnType<typeof getUsers>>>;
export type GetUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users (admin only)
 */
export declare function useGetUsers<TData = Awaited<ReturnType<typeof getUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateUserRoleUrl: (id: number) => string;
/**
 * @summary Update user role (admin only)
 */
export declare const updateUserRole: (id: number, roleUpdate: RoleUpdate, options?: RequestInit) => Promise<User>;
export declare const getUpdateUserRoleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUserRole>>, TError, {
        id: number;
        data: BodyType<RoleUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUserRole>>, TError, {
    id: number;
    data: BodyType<RoleUpdate>;
}, TContext>;
export type UpdateUserRoleMutationResult = NonNullable<Awaited<ReturnType<typeof updateUserRole>>>;
export type UpdateUserRoleMutationBody = BodyType<RoleUpdate>;
export type UpdateUserRoleMutationError = ErrorType<unknown>;
/**
* @summary Update user role (admin only)
*/
export declare const useUpdateUserRole: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUserRole>>, TError, {
        id: number;
        data: BodyType<RoleUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUserRole>>, TError, {
    id: number;
    data: BodyType<RoleUpdate>;
}, TContext>;
export declare const getInitiatePaymentUrl: () => string;
/**
 * @summary Initiate a VIP subscription payment
 */
export declare const initiatePayment: (paymentInput: PaymentInput, options?: RequestInit) => Promise<PaymentInitResponse>;
export declare const getInitiatePaymentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof initiatePayment>>, TError, {
        data: BodyType<PaymentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof initiatePayment>>, TError, {
    data: BodyType<PaymentInput>;
}, TContext>;
export type InitiatePaymentMutationResult = NonNullable<Awaited<ReturnType<typeof initiatePayment>>>;
export type InitiatePaymentMutationBody = BodyType<PaymentInput>;
export type InitiatePaymentMutationError = ErrorType<unknown>;
/**
* @summary Initiate a VIP subscription payment
*/
export declare const useInitiatePayment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof initiatePayment>>, TError, {
        data: BodyType<PaymentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof initiatePayment>>, TError, {
    data: BodyType<PaymentInput>;
}, TContext>;
export declare const getVerifyPaymentUrl: () => string;
/**
 * @summary Verify a payment and upgrade user
 */
export declare const verifyPayment: (paymentVerifyInput: PaymentVerifyInput, options?: RequestInit) => Promise<PaymentVerifyResponse>;
export declare const getVerifyPaymentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof verifyPayment>>, TError, {
        data: BodyType<PaymentVerifyInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof verifyPayment>>, TError, {
    data: BodyType<PaymentVerifyInput>;
}, TContext>;
export type VerifyPaymentMutationResult = NonNullable<Awaited<ReturnType<typeof verifyPayment>>>;
export type VerifyPaymentMutationBody = BodyType<PaymentVerifyInput>;
export type VerifyPaymentMutationError = ErrorType<unknown>;
/**
* @summary Verify a payment and upgrade user
*/
export declare const useVerifyPayment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof verifyPayment>>, TError, {
        data: BodyType<PaymentVerifyInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof verifyPayment>>, TError, {
    data: BodyType<PaymentVerifyInput>;
}, TContext>;
export declare const getGetPaymentHistoryUrl: () => string;
/**
 * @summary Get payment history for current user
 */
export declare const getPaymentHistory: (options?: RequestInit) => Promise<Payment[]>;
export declare const getGetPaymentHistoryQueryKey: () => readonly ["/api/payments/history"];
export declare const getGetPaymentHistoryQueryOptions: <TData = Awaited<ReturnType<typeof getPaymentHistory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPaymentHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPaymentHistory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPaymentHistoryQueryResult = NonNullable<Awaited<ReturnType<typeof getPaymentHistory>>>;
export type GetPaymentHistoryQueryError = ErrorType<unknown>;
/**
 * @summary Get payment history for current user
 */
export declare function useGetPaymentHistory<TData = Awaited<ReturnType<typeof getPaymentHistory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPaymentHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAdsUrl: (params?: GetAdsParams) => string;
/**
 * @summary List ads (admin can see all, users see active)
 */
export declare const getAds: (params?: GetAdsParams, options?: RequestInit) => Promise<Ad[]>;
export declare const getGetAdsQueryKey: (params?: GetAdsParams) => readonly ["/api/ads", ...GetAdsParams[]];
export declare const getGetAdsQueryOptions: <TData = Awaited<ReturnType<typeof getAds>>, TError = ErrorType<unknown>>(params?: GetAdsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAds>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAds>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdsQueryResult = NonNullable<Awaited<ReturnType<typeof getAds>>>;
export type GetAdsQueryError = ErrorType<unknown>;
/**
 * @summary List ads (admin can see all, users see active)
 */
export declare function useGetAds<TData = Awaited<ReturnType<typeof getAds>>, TError = ErrorType<unknown>>(params?: GetAdsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAds>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAdUrl: () => string;
/**
 * @summary Create an ad (admin only)
 */
export declare const createAd: (adInput: AdInput, options?: RequestInit) => Promise<Ad>;
export declare const getCreateAdMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAd>>, TError, {
        data: BodyType<AdInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAd>>, TError, {
    data: BodyType<AdInput>;
}, TContext>;
export type CreateAdMutationResult = NonNullable<Awaited<ReturnType<typeof createAd>>>;
export type CreateAdMutationBody = BodyType<AdInput>;
export type CreateAdMutationError = ErrorType<unknown>;
/**
* @summary Create an ad (admin only)
*/
export declare const useCreateAd: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAd>>, TError, {
        data: BodyType<AdInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAd>>, TError, {
    data: BodyType<AdInput>;
}, TContext>;
export declare const getUpdateAdUrl: (id: number) => string;
/**
 * @summary Update an ad (admin only)
 */
export declare const updateAd: (id: number, adUpdate: AdUpdate, options?: RequestInit) => Promise<Ad>;
export declare const getUpdateAdMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAd>>, TError, {
        id: number;
        data: BodyType<AdUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAd>>, TError, {
    id: number;
    data: BodyType<AdUpdate>;
}, TContext>;
export type UpdateAdMutationResult = NonNullable<Awaited<ReturnType<typeof updateAd>>>;
export type UpdateAdMutationBody = BodyType<AdUpdate>;
export type UpdateAdMutationError = ErrorType<unknown>;
/**
* @summary Update an ad (admin only)
*/
export declare const useUpdateAd: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAd>>, TError, {
        id: number;
        data: BodyType<AdUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAd>>, TError, {
    id: number;
    data: BodyType<AdUpdate>;
}, TContext>;
export declare const getDeleteAdUrl: (id: number) => string;
/**
 * @summary Delete an ad (admin only)
 */
export declare const deleteAd: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteAdMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAd>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteAd>>, TError, {
    id: number;
}, TContext>;
export type DeleteAdMutationResult = NonNullable<Awaited<ReturnType<typeof deleteAd>>>;
export type DeleteAdMutationError = ErrorType<unknown>;
/**
* @summary Delete an ad (admin only)
*/
export declare const useDeleteAd: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAd>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteAd>>, TError, {
    id: number;
}, TContext>;
export declare const getRecordAdImpressionUrl: () => string;
/**
 * @summary Record an ad impression
 */
export declare const recordAdImpression: (adImpressionInput: AdImpressionInput, options?: RequestInit) => Promise<AdImpression>;
export declare const getRecordAdImpressionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof recordAdImpression>>, TError, {
        data: BodyType<AdImpressionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof recordAdImpression>>, TError, {
    data: BodyType<AdImpressionInput>;
}, TContext>;
export type RecordAdImpressionMutationResult = NonNullable<Awaited<ReturnType<typeof recordAdImpression>>>;
export type RecordAdImpressionMutationBody = BodyType<AdImpressionInput>;
export type RecordAdImpressionMutationError = ErrorType<unknown>;
/**
* @summary Record an ad impression
*/
export declare const useRecordAdImpression: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof recordAdImpression>>, TError, {
        data: BodyType<AdImpressionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof recordAdImpression>>, TError, {
    data: BodyType<AdImpressionInput>;
}, TContext>;
export declare const getGetDashboardStatsUrl: () => string;
/**
 * @summary Get admin dashboard stats
 */
export declare const getDashboardStats: (options?: RequestInit) => Promise<DashboardStats>;
export declare const getGetDashboardStatsQueryKey: () => readonly ["/api/stats/dashboard"];
export declare const getGetDashboardStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>;
export type GetDashboardStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get admin dashboard stats
 */
export declare function useGetDashboardStats<TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetWatchHistoryUrl: () => string;
/**
 * @summary Get watch history for current user
 */
export declare const getWatchHistory: (options?: RequestInit) => Promise<WatchHistoryEntry[]>;
export declare const getGetWatchHistoryQueryKey: () => readonly ["/api/stats/watch-history"];
export declare const getGetWatchHistoryQueryOptions: <TData = Awaited<ReturnType<typeof getWatchHistory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWatchHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWatchHistory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWatchHistoryQueryResult = NonNullable<Awaited<ReturnType<typeof getWatchHistory>>>;
export type GetWatchHistoryQueryError = ErrorType<unknown>;
/**
 * @summary Get watch history for current user
 */
export declare function useGetWatchHistory<TData = Awaited<ReturnType<typeof getWatchHistory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWatchHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map