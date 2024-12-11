import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { personasApi } from "@/lib/api/personas";
import type { Persona } from "@/lib/types/persona";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "../ui/label";
import { tokensApi } from "@/lib/api/tokens";
import { formatNumber } from "@/lib/utils";
import { useMemo, useState } from "react";
import Link from "next/link";
import { TokenResponse } from "@/lib/types/tokens";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTokensOnChainData } from "@/hooks/use-tokens-on-chain-data";
import { useTokenHolders } from "@/hooks/use-token-holders";

type ProcessedTokenData = {
  marketCap?: number;
  priceChangeDay?: number;
  liquidity?: number;
};

// Define the exact type that matches tableData
type TableDataType = {
  tokenData: ProcessedTokenData | undefined;
  tokenHolders: any;
  id: number;
  name: string;
  fid: number;
  image_url: string;
  token?: TokenResponse;
  fc_url: string;
  x_url: string;
  post_count: number;
};

export default function Personas() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const router = useRouter();

  const handleRowClick = (fid: string) => {
    router.push(`/${fid}`);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const { data: personas } = useQuery({
    queryKey: ["personas"],
    queryFn: personasApi.getPersonas,
  });

  const tokenData = useTokensOnChainData({
    tokenAddresses:
      personas?.reduce(
        (addresses: string[], persona) =>
          persona?.token?.address
            ? [...addresses, persona.token.address.toLowerCase()]
            : addresses,
        []
      ) ?? [],
  });

  const tokenHoldersData = useTokenHolders({
    tokenAddresses:
      personas?.reduce(
        (addresses: string[], persona) =>
          persona?.token?.address
            ? [...addresses, persona.token.address.toLowerCase()]
            : addresses,
        []
      ) ?? [],
  });

  const tableData = useMemo(() => {
    if (!personas) return [];

    return personas.map((persona) => ({
      ...persona,
      tokenData: tokenData?.tokens?.[persona.token?.address?.toLowerCase()!],
      tokenHolders: tokenHoldersData?.[persona.token?.address?.toLowerCase()!],
    }));
  }, [personas, tokenData, tokenHoldersData]);

  const columns: ColumnDef<TableDataType>[] = [
    {
      header: "Intern Agent",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div className="w-14 h-14 flex-shrink-0">
            <Image
              src={row.original.image_url}
              alt={row.original.name}
              width={59}
              height={59}
              className="rounded-full object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-gray-50 leading-snug text-lg font-medium uppercase cursor-pointer">
              {row.original.name}
            </Label>
            {/* <Label className="text-[#76787a] leading-snug text-sm">
              ${row.original.token?.symbol}
            </Label> */}
          </div>
        </div>
      ),
    },
    {
      header: "Ticker",
      accessorFn: (row) => row.token?.symbol ?? "-",
      cell: ({ getValue }) => {
        const value = getValue();
        if (value === "-") return "-";

        return (
          <Label className="text-gray-50 leading-snug text-lg font-medium uppercase cursor-pointer">
            {value as string}
          </Label>
        );
      },
    },
    {
      id: "market_cap",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() =>
            column.getIsSorted() === "asc"
              ? column.toggleSorting(true)
              : column.toggleSorting(false)
          }
        >
          Market Cap
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      ),
      accessorFn: (row) => row.tokenData?.marketCap ?? "-",
      cell: ({ getValue }) => {
        const value = getValue();
        if (value === "-") return "-";

        return (
          <Label className="text-gray-500 leading-snug text-lg font-medium uppercase cursor-pointer">
            ${formatNumber(value as number)}
          </Label>
        );
      },
      sortingFn: "basic",
    },
    {
      id: "one_day_change",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() =>
            column.getIsSorted() === "asc"
              ? column.toggleSorting(true)
              : column.toggleSorting(false)
          }
        >
          1 Day Change
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      ),
      accessorFn: (row) => row.tokenData?.priceChangeDay ?? "-",
      cell: ({ getValue }) => {
        const value = getValue();
        if (value === "-") return "-";
        const isPositive = (value as number) > 0;
        return (
          <Label
            className={`text-gray-500 leading-snug text-lg font-medium uppercase cursor-pointer ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {(value as number).toFixed(2)}%
          </Label>
        );
      },
      sortingFn: "basic",
    },
    {
      id: "liquidity",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() =>
            column.getIsSorted() === "asc"
              ? column.toggleSorting(true)
              : column.toggleSorting(false)
          }
        >
          Liquidity
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      ),
      accessorFn: (row) => row.tokenData?.liquidity ?? "-",
      cell: ({ getValue }) => {
        const value = getValue();
        if (value === "-") return "-";
        return (
          <Label className="text-gray-500 leading-snug text-lg font-medium uppercase cursor-pointer">
            ${formatNumber(value as number)}
          </Label>
        );
      },
    },
    {
      id: "holder_count",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() =>
            column.getIsSorted() === "asc"
              ? column.toggleSorting(true)
              : column.toggleSorting(false)
          }
        >
          Holders
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      ),
      accessorFn: (row) => row.tokenHolders ?? "-",
      cell: ({ getValue }) => {
        const value = getValue();

        if (!value || value === "-") return "-";

        return value ? (
          <Label className="text-gray-500 leading-snug text-lg font-medium uppercase cursor-pointer">
            {formatNumber(value as number)}
          </Label>
        ) : (
          "-"
        );
      },
      sortingFn: "basic",
    },
    {
      id: "post_count",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() =>
            column.getIsSorted() === "asc"
              ? column.toggleSorting(true)
              : column.toggleSorting(false)
          }
        >
          Posts
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      ),
      accessorFn: (row) => row.post_count ?? "-",
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value ? (
          <Label className="text-gray-500 leading-snug text-lg font-medium uppercase cursor-pointer">
            {formatNumber(value)}
          </Label>
        ) : (
          "-"
        );
      },
      sortingFn: "basic",
    },
    {
      header: "View",
      accessorFn: (row) => row.tokenHolders ?? "-",
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-4">
            {row.original?.x_url && (
              <Link
                href={row.original.x_url}
                target="_blank"
                className="flex items-center"
                onClick={handleLinkClick}
              >
                <div className="w-[30px] h-[30px] relative">
                  <Image
                    src="/x.svg"
                    alt="View"
                    fill
                    className="object-contain"
                    sizes="30px"
                  />
                </div>
              </Link>
            )}
            <Link
              href={row.original.fc_url ?? ""}
              target="_blank"
              className="flex items-center"
              onClick={handleLinkClick}
            >
              <div className="w-[30px] h-[30px] relative">
                <Image
                  src="/farcaster.svg"
                  alt="View"
                  fill
                  className="object-contain"
                  sizes="30px"
                />
              </div>
            </Link>
            <Link
              href={row.original.token?.dex_screener_url ?? ""}
              target="_blank"
              className="flex items-center"
              onClick={handleLinkClick}
            >
              <div className="w-[30px] h-[30px] relative">
                <Image
                  src="/dex-screener.svg"
                  alt="View"
                  fill
                  className="object-contain"
                  sizes="30px"
                />
              </div>
            </Link>
            <Link
              href={row.original.token?.uniswap_url ?? ""}
              target="_blank"
              className="flex items-center"
              onClick={handleLinkClick}
            >
              <div className="w-[30px] h-[30px] relative">
                <Image
                  src="/uniswap.svg"
                  alt="View"
                  fill
                  className="object-contain"
                  sizes="30px"
                />
              </div>
            </Link>
          </div>
        );
      },
    },
    // {
    //   header: "Lifetime Inferences",
    //   accessorFn: (row) => row.token?.lifetime_inferences,
    //   cell: ({ getValue }) => {
    //     const value = getValue() as number;
    //     return value ? formatNumber(value) : "-";
    //   },
    // },
    // {
    //   header: "Intelligence",
    //   accessorFn: (row) => row.token?.intelligence,
    // },
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
  });

  return (
    <Table className="min-w-full text-white rounded-lg overflow-hidden">
      <TableHeader className="bg-[#222224]">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((column) => (
              <TableHead
                key={column.id}
                className="p-4 text-[#909499] font-semibold uppercase leading-[27px] text-base"
              >
                {flexRender(
                  column.column.columnDef.header,
                  column.getContext()
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            className="border-b border-[#232325] bg-[#131314] cursor-pointer"
            onClick={() => handleRowClick(row.original.token?.symbol as string)}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="p-4">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
