import React, { useState } from 'react';
import CustomReport from '../../peopleProfile/contentFeed/CustomReport';
import { defaultReportBlocks } from '../../reportbuilder/constants/reportBuilderConstants';

const DataTab = ({ organizationId }) => {
  const [blocks, setBlocks] = useState([...defaultReportBlocks]);

  return (
    <>
      {organizationId ? (
        <CustomReport
          blocks={blocks}
          organizationId={organizationId}
          setBlocks={setBlocks}
          readonly={true}
        />
      ) : (
        <div></div>
      )}
    </>
  );
};

export default DataTab;
