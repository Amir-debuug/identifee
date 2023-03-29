import { useState } from 'react';

const ViewMoreLess = ({ text, limit, byWords, splitOn = ', ' }) => {
  const [showMore, setShowMore] = useState(false);

  const limitByWords = () => {
    if (byWords) {
      return text.split(splitOn).slice(0, byWords).join(splitOn);
    }
    return text.substring(0, limit);
  };

  const handleShowMore = (e) => {
    e.preventDefault();
    setShowMore(true);
  };

  const handleShowLess = (e) => {
    e.preventDefault();
    setShowMore(false);
  };
  return (
    <>
      {limit > text.length ? (
        text
      ) : (
        <>
          {!showMore && (
            <>
              {limitByWords()}{' '}
              <a href="" className="font-size-sm2" onClick={handleShowMore}>
                (View more)
              </a>{' '}
            </>
          )}
          {showMore && (
            <>
              {text.substring(0, text.length)}{' '}
              <a href="" className="font-size-sm2" onClick={handleShowLess}>
                (Show fewer)
              </a>{' '}
            </>
          )}
        </>
      )}
    </>
  );
};

export default ViewMoreLess;
