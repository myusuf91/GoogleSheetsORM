const SheetsORM = require('../SheetsORM');


const NAME = 'Translations';
const RANGE = 'Translations!A:G';

const ATTRIBUTES = {

  ID: {
    type: 'string',
    column: 'A',
    primaryKey: true,
    defaultsTo: () => {
      return Math.random().toString(32).slice(-8)
    }
  },

  Phrase: {
    type: 'string',
    column: 'B',            
  },

  Language: {
    type: 'string',
    column: 'C',            
  },

  Code: {
    type: 'string',
    column: 'D',            
  },

  Translated: {
    type: 'string',
    column: 'E',            
  },

  CreatedAt: {
    type: 'datetime',
    column: 'F',            
  },

  UpdateCount: {
    type: 'number',
    column: 'G',            
  },

};

module.exports = {
  
  name: NAME,
  range: RANGE,
  attributes: ATTRIBUTES,

  create: async (packets) => {
    const attrs = Object.keys(ATTRIBUTES);
    let primaryKeyIdx = 0;
    attrs.some((f, i) => {
      if(ATTRIBUTES[f].primaryKey) {
        primaryKeyIdx = i;
        return true;
      }
    });

    // generate valid rows from packet
    const validRows = [];
    packets.forEach(row => {
      const validRow = [];
      Object.keys(row).forEach(f => {        
        if(Object.prototype.hasOwnProperty.call(ATTRIBUTES, f)) {
          if(ATTRIBUTES[f].primaryKey) {
            return;
          } else if(ATTRIBUTES[f].type === 'datetime') {
            validRow[ATTRIBUTES[f].column.charCodeAt(0) - 65] = `${ row[f].getUTCFullYear() }-${ (row[f].getUTCMonth() + 1).toString().padStart(2, '0') }-${ row[f].getUTCDate().toString().padStart(2, '0') } ${ row[f].getUTCHours().toString().padStart(2, '0') }:${ row[f].getUTCMinutes().toString().padStart(2, '0') }:${ row[f].getUTCSeconds().toString().padStart(2, '0') }`;
          } else {
            validRow[ATTRIBUTES[f].column.charCodeAt(0) - 65] = row[f];            
          }
        }
      });
      if(validRow.length > 0) {  
        validRow[primaryKeyIdx] = Math.random().toString(32).slice(-8); 
        validRows.push(validRow);
      }
    });

    if(validRows.length > 0) {
      const res = await SheetsORM.appendToSheet(RANGE, validRows);
      return res?.data;
    } else {
      throw 'Invalid packet';
    }
  },

  find: async ({select, where}) => {
    const attrs = Object.keys(ATTRIBUTES);
    
    // generate available select fields
    const validSelects = select.filter(f => attrs.includes(f) || f === '*');
    let parsedQuery = `SELECT ${ validSelects.join(',') }`;
    
    if(where) {
      // generate valid where keys
      const validWheres = Object.keys(where).filter(f => attrs.includes(f));      
      if(validWheres.length > 0) {        
        const conditions = [];
        validWheres.forEach(f => {
          if(ATTRIBUTES[f].type === 'string') {
            conditions.push(`${ ATTRIBUTES[f].column } = '${ where[f] }'`);
          } else if(ATTRIBUTES[f].type === 'number') {
            conditions.push(`${ ATTRIBUTES[f].column } = ${ where[f] }`);
          } else if(ATTRIBUTES[f].type === 'datetime') {
            conditions.push(`${ ATTRIBUTES[f].column } = datetime '${ where[f] }'`);
          }
        });
        if(conditions.length) {
          parsedQuery += ` where ${ conditions.join(' and ') }`
        }
      }
    }

    const res = await SheetsORM.getSheetsQueryResponse(RANGE, parsedQuery);
    return res?.table;
  },


  update: async (id, packet) => {
    let idCol = 'A';
    const attrs = Object.keys(ATTRIBUTES);
    attrs.some(f => {
      if(ATTRIBUTES[f].primaryKey) {
        idCol = ATTRIBUTES[f].column;
      }
      return true;
    });
    const row = await SheetsORM.lookup(`${ NAME }!${ idCol }:${ idCol }`, id);        
    if(row === -1) {
      return { updated: 0 };
    }

    let updateKeys = Object.keys(packet).filter(f => attrs.includes(f));
    for(f of updateKeys) {      
      let updateCol = false;
      attrs.some(k => {        
        if(k === f) {
          updateCol = ATTRIBUTES[k].column;
          return true;
        }
      });
      if(!updateCol) {
        continue;
      } 
      await SheetsORM.updateRowInSheet(`${ NAME }!${ updateCol }${ row }`, [packet[f]]);          
    }
  },


  destroy: async (id) => {
    let idCol = 'A';
    Object.keys(ATTRIBUTES).some(f => {
      if(ATTRIBUTES[f].primaryKey) {
        idCol = ATTRIBUTES[f].column;
      }
      return true;
    });
    const row = await SheetsORM.lookup(`${ NAME }!${ idCol }:${ idCol }`, id);    
    if(row === -1) {
      return { deleted: 0 };
    }
    const response = await SheetsORM.clearFromSheet(`${ NAME }!${ row }:${ row }`);
    return { deleted: 1 };
  }
}