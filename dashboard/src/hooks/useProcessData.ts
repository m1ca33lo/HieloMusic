import { IBaseApiResponse, IUseProcessDataOptions } from '@/interfaces/api';

export function useProcessData<R>(
    data: IBaseApiResponse<R> | undefined,
    isLoading: boolean,
    options: IUseProcessDataOptions = {},
) {
    const {
        loadingComponent = 'Loading',
        failedComponent = 'Failed to fetch data',
        enabled = true,
    } = options;

    return function <T>(successValue: T) {
        return isLoading && enabled
            ? loadingComponent
            : data?.success || !enabled
            ? typeof successValue === 'function'
                ? successValue()
                : successValue
            : failedComponent;
    };
}