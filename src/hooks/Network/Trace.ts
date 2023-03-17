import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { axiosGw } from 'constants/axiosInstances';

export type TraceResponse = {
  UUID: string;
  attachFile: number;
  command: 'trace';
  completed: number;
  custom: number;
  details: {
    duration?: number;
    numberOfPackets?: number;
    interface: string;
    network: string;
    serial: string;
    uri: string;
    when: number;
  };
  errorCode: number;
  errorText: string;
  executed: number;
  executionTime: number;
  results: {
    serial: string;
    status: {
      error: number;
      resultCode: number;
      resultText: string;
      text: string;
    };
  };
  serialNumber: string;
  status: string;
  submitted: number;
  submittedBy: string;
  waitingForFile: number;
  when: number;
};

const startTrace = async (
  traceData:
    | {
        serialNumber: string;
        when?: number;
        network: 'up' | 'down';
        duration: number;
      }
    | {
        serialNumber: string;
        when?: number;
        network: 'up' | 'down';
        numberOfPackets: number;
      },
) =>
  axiosGw.post<TraceResponse>(`device/${traceData.serialNumber}/trace`, {
    ...traceData,
    when: traceData.when ?? 0,
  });

export const useTrace = ({ serialNumber, alertOnCompletion }: { serialNumber: string; alertOnCompletion: boolean }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const toast = useToast();

  return useMutation(startTrace, {
    onSuccess: () => {
      queryClient.invalidateQueries(['commands', serialNumber]);
      if (alertOnCompletion) {
        toast({
          id: `trace-success-${serialNumber}`,
          title: t('common.success'),
          description: t('controller.trace.success', { serialNumber }),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      }
    },
  });
};

export const downloadTrace = (serialNumber: string, commandId: string) =>
  axiosGw.get(`file/${commandId}?serialNumber=${serialNumber}`, { responseType: 'arraybuffer' });

export const useDownloadTrace = ({ serialNumber, commandId }: { serialNumber: string; commandId: string }) => {
  const { t } = useTranslation();
  const toast = useToast();

  return useQuery(['download-trace', serialNumber, commandId], () => downloadTrace(serialNumber, commandId), {
    enabled: false,
    onSuccess: (response) => {
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const headerLine =
        (response.headers['content-disposition'] as string | undefined) ??
        (response.headers['content-disposition'] as string | undefined);
      const filename = headerLine?.split('filename=')[1]?.split(',')[0] ?? `Trace_${commandId}.pcap`;
      link.download = filename;
      link.click();
    },
    onError: (e) => {
      if (axios.isAxiosError(e)) {
        const bufferResponse = e.response?.data;
        let errorMessage = '';
        // If the response is a buffer, parse to JSON object
        if (bufferResponse instanceof ArrayBuffer) {
          const decoder = new TextDecoder('utf-8');
          const json = JSON.parse(decoder.decode(bufferResponse));
          errorMessage = json.ErrorDescription;
        }

        toast({
          id: `trace-download-error-${serialNumber}`,
          title: t('common.error'),
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      }
    },
  });
};
