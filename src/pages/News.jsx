import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import SearchDefault from '../components/commons/SearchDefault';
import NewsFilter from '../components/news/NewsFilter';
import Newspaper from '../components/news/Newspaper';
import { FilterMenuData, AdditionalMenu } from '../components/news/constant';
import newsService from '../services/news.service';
import SkeletonNewsLoader from '../components/loaders/NewsLoader';

const News = () => {
  const [searchValue, setSearchValue] = useState('');
  const [search, setSearch] = useState(searchValue);
  const [heading, setHeading] = useState('Top headlines');
  const [news, setNews] = useState([]);
  const [filter, setFilter] = useState('top-headlines');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [resultsOf, setResultsOf] = useState(12);
  const _defaultPagination = {
    page: 1,
    maxItem: 12,
    totalPages: 1,
  };
  const [pagination, setPagination] = useState(_defaultPagination);

  useEffect(() => {
    (async () => {
      if (!loading) {
        await getNews();
      }
      calcResultsOf();
    })();
  }, [filter, page, search]);

  const getCategory = () => {
    const exclude = ['top-headlines', 'us'];
    if (exclude.includes(filter)) {
      return '';
    }
    return filter;
  };

  const getBookmarks = async () => {
    const resp = await newsService.getArticles({
      page,
      limit: _defaultPagination.maxItem,
    });

    setNews(resp.data.data);
    setPagination({
      ...pagination,
      maxItem: resp.data.pagination.count,
      totalPages: resp.data.pagination.totalPages,
    });

    setLoading(false);
    calcResultsOf();
  };

  const getNews = async (e) => {
    setLoading(true);
    try {
      const query = {
        page,
        q: search,
        category: getCategory(),
        country: 'us',
      };

      let resp;

      if (filter === 'readlater') {
        return await getBookmarks();
      } else {
        resp = await newsService.getNews(query);
      }

      setNews(resp.data.articles);
      setPagination({
        ...pagination,
        maxItem: resp.data.total,
        totalPages: Math.round(resp.data.total / _defaultPagination.maxItem),
      });
      calcResultsOf();
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const calcResultsOf = () => {
    const a = _defaultPagination.maxItem * pagination.page;
    const b = a % pagination.maxItem;

    if (a - b === 0) {
      setResultsOf(a);
      return;
    }

    if (a < pagination.maxItem) {
      setResultsOf(pagination.maxItem);
      return;
    }

    setResultsOf(a - b);
  };

  const reset = async () => {
    setSearch('');
    setSearchValue('');
    setFilter('top-headlines');
    setHeading('Top headlines');
    setPagination(_defaultPagination);
    calcResultsOf();
  };

  const handleKeyPress = async (event) => {
    if (event.key === 'Enter') {
      setPage(1);
      setHeading(`News Results: ${event.target.value}`);
      setSearch(event.target.value);
      // unselect category filter
      setFilter('');
      calcResultsOf();
    }
  };

  const onPageChange = async (page) => {
    setPage(page);
    setPagination({ ...pagination, page });
    calcResultsOf();
  };

  const onSearchInput = (e) => {
    if (e.target.value === '') {
      reset();
    } else {
      setSearchValue(e.target.value);
    }
  };

  const setActiveFilter = (e) => {
    if (searchValue !== '') {
      setSearchValue('');
      setSearch('');
    }
    setHeading(e.name);
    setFilter(e.id);
    setPage(1);
    setPagination(_defaultPagination);
  };

  const onBookmark = async (article, index) => {
    // we are assuming bookmark articles contains an id
    // and use this to delete or add bookmarks
    if (index !== -1 && filter === 'readlater') {
      setNews(news.filter((v, i) => i !== index));
    }
  };

  return (
    <>
      <Row className="w-100" noGutters>
        <Col xs={3}>
          <Card className="m-0">
            <Card.Header className="w-100 border-bottom-0 mx-0 px-3 py-3 mb-0">
              <SearchDefault
                id="search-news"
                placeholder="Search"
                label="Search"
                value={searchValue}
                onHandleKeyPress={handleKeyPress}
                onHandleChange={onSearchInput}
              />
            </Card.Header>
            <Card.Body className="pt-0 px-0 pb-2">
              {FilterMenuData.map((menu) => (
                <NewsFilter
                  key={menu.id}
                  icon={menu.icon}
                  title={menu.name}
                  id={menu.id}
                  active={filter}
                  setActive={setActiveFilter}
                />
              ))}
              <hr />
              {AdditionalMenu.map((menu) => (
                <NewsFilter
                  key={menu.id}
                  icon={menu.icon}
                  title={menu.name}
                  id={menu.id}
                  active={filter}
                  setActive={setActiveFilter}
                />
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={9} className="px-2">
          <Card className="m-0">
            <Card.Header className="border-bottom mb-2">
              <h4 className="mb-0">{heading}</h4>
              {news.length > 0 && (
                <p className="mt-2 mb-0">
                  {`${resultsOf} of ${pagination.maxItem} Results`}
                </p>
              )}
            </Card.Header>
            <Card.Body className="px-3 pt-0 pb-3">
              {loading ? (
                <SkeletonNewsLoader count={5} />
              ) : (
                <Newspaper
                  search={search}
                  articles={news}
                  pagination={pagination}
                  onPageChange={(p) => onPageChange(p)}
                  onBookmark={onBookmark}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default News;
