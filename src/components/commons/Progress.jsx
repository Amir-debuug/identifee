import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import {
  CircularProgressbar,
  buildStyles,
  CircularProgressbarWithChildren,
} from 'react-circular-progressbar';

export const ProgressBarDefault = ({ now = 0, variant }) => {
  return (
    <div className="w-100 d-flex justify-content-center align-items-center text-primary fw-bold">
      <ProgressBar
        now={parseInt(now)}
        className="w-75 mx-2"
        variant={variant}
      />
      <span className={variant ? 'text-success' : 'text-primary'}>
        {parseFloat(now)?.toFixed(2)}%
      </span>
    </div>
  );
};

export const ProgressCircleDefault = ({
  now,
  label = false,
  classnames,
  simple,
}) => {
  const nowParsed = parseInt(now);
  return (
    <div className={`size-progress-circle ${classnames}`}>
      {nowParsed !== 100 && (
        <CircularProgressbar
          value={parseInt(now)}
          text={label && `${parseFloat(now)?.toFixed(2)}%`}
          styles={buildStyles({
            textColor: 'red',
            pathColor: 'var(--secondaryColor)',
            trailColor: 'lightgray',
          })}
          strokeWidth={10}
        />
      )}
      {nowParsed === 100 && !simple && (
        <CircularProgressbarWithChildren
          value={now}
          strokeWidth={50}
          styles={buildStyles({
            pathColor: 'var(--secondaryColor)',
            strokeLinecap: 'butt',
          })}
        >
          <span className="material-icons-outlined text-white">done</span>
        </CircularProgressbarWithChildren>
      )}
    </div>
  );
};
