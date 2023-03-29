import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const PublisherIcon = ({ article }) => {
  return (
    <span className="font-weight-medium">
      <OverlayTrigger
        key={`left`}
        placement={`top`}
        overlay={<Tooltip id={`tooltip-${`left`}`}>{article.source}</Tooltip>}
      >
        <span
          className={`material-icons-outlined cursor-pointer fs-20 py-1 inline`}
        >
          {'info'}
        </span>
      </OverlayTrigger>
    </span>
  );
};

export default PublisherIcon;
