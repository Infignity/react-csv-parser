import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

function CSVUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [uploadData, setUploadData] = useState([]);
  const [customFields, setCustomFields] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleCustomFieldNameChange = (index) => (event) => {
    const newCustomFields = [...customFields];
    newCustomFields[index].field_name = event.target.value;
    setCustomFields(newCustomFields);
  };

  const handleCustomFieldValueChange = (index) => (event) => {
    const newCustomFields = [...customFields];
    newCustomFields[index].field_value = event.target.value;
    setCustomFields(newCustomFields);
  };

  const COLUMN_MAP = {
    'firstName': 'First Name',
    'lastName': 'Last Name',
    'headline': 'Headline',
    'linkedin_url': 'Person LinkedIn URL',
    'email': 'Email',
    'company': 'Company',
    'company_linkedin': 'Company LinkedIn',
    'website': 'Website',
  };

  

  const parseCSV = () => {
    if (selectedFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            Papa.parse(event.target.result, {
                complete: function(results) {
                    console.log('Parsed results:', results);

                    if (results.data && Array.isArray(results.data) && results.data.length > 0) {
                        if (Array.isArray(results.data[0])) {
                            setColumns(results.data[0]);
                            setUploadData(results.data.slice(1));
                        } else {
                            console.error("CSV data is not formatted as expected. Expected an array for the first row.");
                        }
                    } else {
                        console.error("CSV data is not formatted as expected. No data found or not in array format.");
                    }
                },
                header: false // This is crucial. We're manually handling headers, so we'll set this to false.
            });
        };
        reader.readAsText(selectedFile);
    }
  };




  const handleColumnSelect = (column) => (event) => {
    setSelectedColumns({ ...selectedColumns, [column]: event.target.value });
  };

  const mappedData = uploadData.map(row => {
    const newRow = {};
    Object.keys(selectedColumns).forEach(column => {
      newRow[column] = row[columns.indexOf(selectedColumns[column])];
    });
    return newRow;
  });

  console.log('Selected columns:', selectedColumns);
  console.log('Upload data:', uploadData);

  const handleCustomFieldChange = (index, key) => (event) => {
    const newCustomFields = [...customFields];
    newCustomFields[index][key] = event.target.value;
    setCustomFields(newCustomFields);
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { field_name: '', field_value: '' }]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (Object.keys(selectedColumns).length > 0) {
      try {
        const mappedData = uploadData.map((row) => {
          const newRow = {};
          // For standard fields
          Object.keys(selectedColumns).forEach(column => {
            const columnIndex = columns.indexOf(selectedColumns[column]);
            const backendColumnName = COLUMN_MAP[column] || column;
            newRow[backendColumnName] = row[columnIndex] || '';
          });
          // For custom fields
          customFields.forEach(customField => {
            newRow[customField.field_name] = row[columns.indexOf(customField.field_value)] || '';
          });
    
          return newRow;
        });

        const payload = {
          csv_data: mappedData,
          selected_columns: Object.values(COLUMN_MAP),
          custom_fields: customFields.map((cf) => cf.field_name),
        };
    
        // Log the payload
        console.log('Payload being sent to backend:', payload);

        console.log('Data being sent to backend:', JSON.stringify({
          csv_data: mappedData,
          selected_columns: Object.values(selectedColumns),
          custom_fields: customFields,
        }, null, 2));

        const response = await axios.post('http://127.0.0.1:8000/upload-csv/', {
            csv_data: mappedData,
            selected_columns: Object.values(COLUMN_MAP),
            custom_fields: customFields,
          }, 
          {
            headers: {
              'Content-Type': 'application/json',
            }
        });


        console.log('Upload successful', response.data);
      } catch (error) {
        console.error('Error uploading data', error.response?.data || error.message);
      }
    } else {
      console.error('No columns selected');
    }
  };

  


  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={parseCSV}>Load CSV</button>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First name:</label>
          <select onChange={handleColumnSelect('firstName')}>
            <option value="">Select Field</option>
            {columns.map((col, index) => (
              <option key={index} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Last name:</label>
          <select onChange={handleColumnSelect('lastName')}>
            <option value="">Select Field</option>
            {columns.map((col, index) => (
              <option key={index} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Headline:</label>
          <select onChange={handleColumnSelect('headline')}>
            <option value="">Select Field</option>
            {columns.map((col, index) => (
              <option key={index} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>LinkedIn URL:</label>
          <select onChange={handleColumnSelect('linkedin_url')}>
            <option value="">Select Field</option>
            {columns.map((col, index) => (
              <option key={index} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Email:</label>
          <select onChange={handleColumnSelect('email')}>
            <option value="">Select Field</option>
            {columns.map((col, index) => (
              <option key={index} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Company:</label>
          <select onChange={handleColumnSelect('company')}>
            <option value="">Select Field</option>
            {columns.map((col, index) => (
              <option key={index} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Company LinkedIn:</label>
          <select onChange={handleColumnSelect('company_linkedin')}>
            <option value="">Select Field</option>
            {columns.map((col, index) => (
              <option key={index} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Website:</label>
          <select onChange={handleColumnSelect('website')}>
            <option value="">Select Field</option>
            {columns.map((col, index) => (
              <option key={index} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
        
        {/* Custom Fields UI */}
      {customFields.map((customField, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Custom Field Name"
            value={customField.field_name}
            onChange={handleCustomFieldNameChange(index)}
          />
          <select
            value={customField.field_value}
            onChange={handleCustomFieldValueChange(index)}
          >
            <option value="">Select Column</option>
            {columns.map((column, colIndex) => (
              <option key={colIndex} value={column}>
                {column}
              </option>
            ))}
          </select>
          <button onClick={() => {
            const newCustomFields = [...customFields];
            newCustomFields.splice(index, 1);
            setCustomFields(newCustomFields);
          }}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addCustomField}>Add Custom Field</button>

        <button type="submit">Upload Selected Data</button>
      </form>
    </div>
  );
}

export default CSVUploader;