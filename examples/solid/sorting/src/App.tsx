import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  ColumnDef,
  createSolidTable,
} from '@tanstack/solid-table'
import { makeData, Person } from './makeData'
import { createSignal, For, Show, createEffect } from 'solid-js'

function App() {
  const [data, setData] = createSignal(makeData(100_000))
  const [sorting, setSorting] = createSignal<SortingState>([])
  const [enableMultiSort, setEnableMultiSort] = createSignal<boolean>(true)
  const [isClickToSort, setIsClickToSort] = createSignal<boolean>(false)
  const refreshData = () => setData(makeData(100_000))

  const columns: ColumnDef<Person>[] = [
    {
      header: 'Name',
      footer: props => props.column.id,
      columns: [
        {
          accessorKey: 'firstName',
          cell: info => info.getValue(),
          footer: props => props.column.id,
        },
        {
          accessorFn: row => row.lastName,
          id: 'lastName',
          cell: info => info.getValue(),
          header: () => <span>Last Name</span>,
          footer: props => props.column.id,
        },
      ],
    },
    {
      header: 'Info',
      footer: props => props.column.id,
      columns: [
        {
          accessorKey: 'age',
          header: () => 'Age',
          footer: props => props.column.id,
        },
        {
          header: 'More Info',
          columns: [
            {
              accessorKey: 'visits',
              header: () => <span>Visits</span>,
              footer: props => props.column.id,
            },
            {
              accessorKey: 'status',
              header: 'Status',
              footer: props => props.column.id,
            },
            {
              accessorKey: 'progress',
              header: 'Profile Progress',
              footer: props => props.column.id,
            },
          ],
        },
      ],
    },
  ]

  const [table, setTable] = createSignal(createTable())

  function createTable(){
    return createSolidTable({
      get data() {
        return data()
      },
      columns,
      state: {
        get sorting() {
          return sorting()
        },
      },
      get enableMultiSort() {
        return enableMultiSort()
      },
      ...(isClickToSort() ? {isMultiSortEvent() { return true}} : undefined),
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      debugTable: true,
    })
  }

  createEffect(() => {
    // setIsClickToSort(isClickToSort())
    setTable(createTable())
  })

  return (
    <div class="p-2">
      <div className="flex items-center">
        <label className="mr-2">enableMultiSort: </label>
        <input type="checkbox" checked={enableMultiSort()} onChange={e => {
          setEnableMultiSort(e.target.checked)
          if (!e.target.checked) {
            setIsClickToSort(false)
          }
        }}/>
        {enableMultiSort() && <span className="ml-2 text-red-500">Press `Shift` key and clicks a
new column.</span>}
      </div>
      {
        enableMultiSort() && (
          <div className="flex items-center">
            <label className="mr-2">Click to multi-sort: </label>
            <input type="checkbox" checked={isClickToSort()} onChange={e => {
              setIsClickToSort(e.target.checked)
            }}/>
          </div>
        )
      }
      <table>
        <thead>
          <For each={table().getHeaderGroups()}>
            {headerGroup => (
              <tr>
                <For each={headerGroup.headers}>
                  {header => (
                    <th colSpan={header.colSpan}>
                      <Show when={!header.isPlaceholder}>
                        <div
                          class={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : undefined
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </Show>
                    </th>
                  )}
                </For>
              </tr>
            )}
          </For>
        </thead>
        <tbody>
          <For each={table().getRowModel().rows.slice(0, 10)}>
            {row => (
              <tr>
                <For each={row.getVisibleCells()}>
                  {cell => (
                    <td>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <div>{table().getRowModel().rows.length} Rows</div>
      <div>
        <button onClick={() => refreshData()}>Refresh Data</button>
      </div>
      <pre>{JSON.stringify(sorting(), null, 2)}</pre>
    </div>
  )
}

export default App

