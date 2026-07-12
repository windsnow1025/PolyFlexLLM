import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ColumnsPanelTrigger,
  DataGridPremium,
  DEFAULT_GRID_COL_TYPE_KEY,
  ExportCsv,
  ExportPrint,
  FilterPanelTrigger,
  getGridDefaultColumnTypes,
  GridActionsCellItem,
  GridRowModes,
  PivotPanelTrigger,
  QuickFilter,
  QuickFilterClear,
  QuickFilterControl,
  QuickFilterTrigger,
  Toolbar,
  ToolbarButton,
} from '@mui/x-data-grid-premium';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import PivotTableChartIcon from '@mui/icons-material/PivotTableChart';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {InputAdornment, styled, TextField, Tooltip, Typography} from "@mui/material";

function EditToolbar({onAddRow}) {
  const StyledQuickFilter = styled(QuickFilter)({
    display: 'grid',
    alignItems: 'center',
    marginLeft: 'auto',
  });

  const StyledToolbarButton = styled(ToolbarButton)(
    ({ theme, ownerState }) => ({
      gridArea: '1 / 1',
      width: 'min-content',
      height: 'min-content',
      zIndex: 1,
      opacity: ownerState.expanded ? 0 : 1,
      pointerEvents: ownerState.expanded ? 'none' : 'auto',
      transition: theme.transitions.create(['opacity']),
    })
  );

  const StyledTextField = styled(TextField)(({ theme, ownerState }) => ({
    gridArea: '1 / 1',
    overflowX: 'clip',
    width: ownerState.expanded ? 260 : 'var(--trigger-width)',
    opacity: ownerState.expanded ? 1 : 0,
    transition: theme.transitions.create(['width', 'opacity']),
  }));

  return (
    <Toolbar>
      <Typography fontWeight="medium" sx={{ flex: 1, mx: 0.5 }}>
        Toolbar
      </Typography>

      <Tooltip title="Download as CSV">
        <ExportCsv render={<ToolbarButton />}>
          <FileDownloadIcon fontSize="small" />
        </ExportCsv>
      </Tooltip>
      <Tooltip title="Print">
        <ExportPrint render={<ToolbarButton />}>
          <PrintIcon fontSize="small" />
        </ExportPrint>
      </Tooltip>

      <StyledQuickFilter>
        <QuickFilterTrigger
          render={(triggerProps, state) => (
            <Tooltip title="Search" enterDelay={0}>
              <StyledToolbarButton
                {...triggerProps}
                ownerState={{ expanded: state.expanded }}
                color="default"
                aria-disabled={state.expanded}
              >
                <SearchIcon fontSize="small" />
              </StyledToolbarButton>
            </Tooltip>
          )}
        />
        <QuickFilterControl
          render={({ ref, ...controlProps }, state) => (
            <StyledTextField
              {...controlProps}
              ownerState={{ expanded: state.expanded }}
              inputRef={ref}
              aria-label="Search"
              placeholder="Search..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: state.value ? (
                    <InputAdornment position="end">
                      <QuickFilterClear
                        edge="end"
                        size="small"
                        aria-label="Clear search"
                        material={{ sx: { marginRight: -0.75 } }}
                      >
                        <CancelIcon fontSize="small" />
                      </QuickFilterClear>
                    </InputAdornment>
                  ) : null,
                  ...controlProps.slotProps?.input,
                },
                ...controlProps.slotProps,
              }}
            />
          )}
        />
      </StyledQuickFilter>

      <Tooltip title="Columns">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>

      <Tooltip title="Filters">
        <FilterPanelTrigger render={<ToolbarButton />}>
          <FilterListIcon fontSize="small" />
        </FilterPanelTrigger>
      </Tooltip>

      <Tooltip title="Pivot">
        <PivotPanelTrigger
          render={(triggerProps, state) => (
            <ToolbarButton
              {...triggerProps}
              color={state.active ? 'primary' : 'default'}
            />
          )}
        >
          <PivotTableChartIcon fontSize="small" />
        </PivotPanelTrigger>
      </Tooltip>

      <div className="pt-1">
        <Button
          startIcon={<AddIcon/>}
          onClick={onAddRow}
          sx={{ px: 0.625, py: 0.5 }}
        >
          Add record
        </Button>
      </div>
    </Toolbar>
  );
}

function CustomDataGrid({
                          columns,
                          fetchData,
                          addRow,
                          updateRow,
                          deleteRow,
                        }) {
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const newData = await fetchData();

      const isRowEqual = (row1, row2) => {
        const cleanRow1 = { ...row1 };
        const cleanRow2 = { ...row2 };
        delete cleanRow1.isNew;
        delete cleanRow2.isNew;

        return JSON.stringify(cleanRow1) === JSON.stringify(cleanRow2);
      };

      setRows((prevRows) => {
        const updatedRows = [...prevRows];
        const existingRowsMap = new Map(prevRows.map(row => [row.id, row]));
        const newRowsMap = new Map(newData.map(row => [row.id, row]));

        newData.forEach((newRow) => {
          const existingRow = existingRowsMap.get(newRow.id);
          const existingIndex = updatedRows.findIndex(row => row.id === newRow.id);

          if (existingRow) {
            if (!isRowEqual(existingRow, newRow)) {
              updatedRows[existingIndex] = { ...newRow, isNew: false };
            }
          } else {
            updatedRows.push({ ...newRow, isNew: false });
          }
        });

        return updatedRows.filter(row =>
          newRowsMap.has(row.id) || row.isNew
        );
      });
    } catch (err) {
      setAlertMessage(err.message);
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processRowUpdate = async (newRow) => {
    const updatedRow = {...newRow, isNew: false};
    try {
      if (newRow.isNew) {
        await addRow(updatedRow);
        setAlertMessage('Record added');
      } else {
        await updateRow(updatedRow);
        setAlertMessage('Record updated');
      }
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === newRow.id ? updatedRow : row))
      );
      setAlertSeverity('success');
    } catch (err) {
      setAlertMessage(err.message);
      setAlertSeverity('error');
    } finally {
      setAlertOpen(true);
    }
    return updatedRow;
  };

  const handleDeleteClick = async (id) => {
    try {
      await deleteRow(id);
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      setAlertMessage('Record deleted');
      setAlertSeverity('success');
    } catch (err) {
      setAlertMessage(err.message);
      setAlertSeverity('error');
    } finally {
      setAlertOpen(true);
    }
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel((prevModel) => ({
      ...prevModel,
      [id]: {mode: GridRowModes.View, ignoreModifications: true},
    }));

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow?.isNew) {
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    }
  };

  const handleAddRow = () => {
    const id = Math.max(0, ...rows.map((row) => row.id)) + 1;

    const newRowDefaults = Object.fromEntries(columns.map((col) => {
      let defaultValue = '';
      if (col.type === 'number') {
        defaultValue = 0;
      } else if (col.type === 'boolean') {
        defaultValue = false;
      }
      return [col.field, defaultValue];
    }));

    setRows((prevRows) => [
      {
        ...newRowDefaults,
        id: id,
        isNew: true,
      },
      ...prevRows,
    ]);

    setRowModesModel((prevModel) => ({
      ...prevModel,
      [id]: {mode: GridRowModes.Edit, fieldToFocus: columns[0]?.field},
    }));
  };

  const wrapOperator = (operator) => {
    const getApplyFilterFn = (filterItem, column) => {
      const innerFilterFn = operator.getApplyFilterFn(filterItem, column);
      if (!innerFilterFn) {
        return innerFilterFn;
      }

      return (value, row, column, apiRef) => {
        const rowId = apiRef.current.getRowId(row);
        if (rowSelectionModelLookupRef.current[rowId] || rowModesModel[rowId]?.mode === GridRowModes.Edit) {
          return true;
        }

        return innerFilterFn(value, row, column, apiRef);
      };
    };

    return {
      ...operator,
      getApplyFilterFn,
    };
  };

  const defaultColumnTypes = getGridDefaultColumnTypes();

  const wrapFilterOperators = (columns) => {
    return columns.map((col) => {
      const filterOperators =
        col.filterOperators ??
        defaultColumnTypes[col.type ?? DEFAULT_GRID_COL_TYPE_KEY].filterOperators;

      return {
        ...col,
        filterOperators: filterOperators.map((operator) => wrapOperator(operator)),
      };
    });
  };

  const enhancedColumns = wrapFilterOperators([
    ...columns,
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 0.2,
      getActions: ({id}) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon/>}
              label="Save"
              onClick={() =>
                setRowModesModel((prevModel) => ({
                  ...prevModel,
                  [id]: {mode: GridRowModes.View},
                }))
              }
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CloseIcon/>}
              label="Cancel"
              onClick={handleCancelClick(id)}
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon/>}
            label="Edit"
            onClick={() =>
              setRowModesModel((prevModel) => ({
                ...prevModel,
                [id]: {mode: GridRowModes.Edit},
              }))
            }
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon/>}
            label="Delete"
            onClick={() => handleDeleteClick(id)}
          />,
        ];
      },
    },
  ]);

  const [models, setModels] = useState({
    rowSelectionModel: { type: 'include', ids: new Set() },
    filterModel: {},
  });

  const rowSelectionModelLookup = useMemo(
    () => {
      const lookup = {};
      models.rowSelectionModel.ids.forEach((rowId) => {
        lookup[rowId] = rowId;
      });
      return lookup;
    },
    [models.rowSelectionModel]
  );

  const rowSelectionModelLookupRef = useRef(rowSelectionModelLookup);
  rowSelectionModelLookupRef.current = rowSelectionModelLookup;

  const handleRowSelectionModelChange = useCallback(
    (newRowSelectionModel) =>
      setModels((prev) => ({
        ...prev,
        rowSelectionModel: newRowSelectionModel,
        filterModel: {...prev.filterModel},
      })),
    []
  );

  const handleFilterModelChange = useCallback(
    (newFilterModel) =>
      setModels((prev) => ({...prev, filterModel: newFilterModel})),
    []
  );

  return (
    <div>
      <div>
        <DataGridPremium
          rows={rows}
          columns={enhancedColumns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowSelectionModelChange={handleRowSelectionModelChange}
          onFilterModelChange={handleFilterModelChange}
          onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
          processRowUpdate={processRowUpdate}
          loading={loading}
          slots={{
            toolbar: EditToolbar,
          }}
          slotProps={{
            toolbar: {onAddRow: handleAddRow},
          }}
          pagination={true}
          showToolbar
        />
      </div>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertSeverity}
          sx={{width: '100%'}}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default CustomDataGrid;