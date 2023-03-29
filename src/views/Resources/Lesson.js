import React, { useEffect, useState } from 'react';
import { Row, Col, CardBody, Card } from 'reactstrap';
import { Steps, Step } from 'react-step-builder';
import { useParams } from 'react-router-dom';
import Heading from '../../components/heading';
import Nav from '../../components/lesson/nav';
import Page from '../../components/lesson/page';
import Hero from '../../components/lesson/hero';
import { API } from '../../services/api';
import lessonService from '../../services/lesson.service';
import categoryService from '../../services/category.service';
import {
  COMPLETED,
  CONGRATULATIONS,
  DELETED,
  LESSON_DELETED,
  QUIZ,
} from '../../utils/constants';
import Loading from '../../components/Loading';
import CategoryPartnerLogo from '../../components/lesson/CategoryPartnerLogo';
import PageTitle from '../../components/commons/PageTitle';

export default function Lesson(props) {
  const api = new API();
  const { id, course_id } = useParams();
  const nextLessons = props?.location?.state?.nextLessons;
  const [lesson, setLesson] = useState(null);
  const [otherLessons, setOtherLessons] = useState([]);
  const [nextLesson, setNextLesson] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const getLesson = async () => {
    window.scrollTo(0, 0);

    if (lesson && lesson.id === id) {
      return;
    }

    const apiLesson = await api
      .GetLessonById(id)
      .catch((err) => console.log(err));

    if (!apiLesson) {
      return;
    }

    try {
      const resp = await lessonService.GetLessonTrackByLessonId(id, {
        self: true,
      });

      const { completed_at, status } = resp || {};

      let newPages = apiLesson.pages.slice();

      if (completed_at && status === COMPLETED) {
        newPages = apiLesson.pages.filter((page) => !page.type.includes(QUIZ));
      }

      setLesson({
        ...apiLesson,
        pages: newPages,
        lessonTrack: resp || {},
      });
    } catch (e) {
      // first time lesson progress comes null, so default/first page load
      const newPages = apiLesson.pages.slice();
      setLesson({
        ...apiLesson,
        pages: newPages,
        lessonTrack: {},
      });
    }
  };

  useEffect(() => {
    getLesson();
  }, [id]);

  useEffect(() => {
    if (nextLessons?.length > 0) {
      setNextLesson(nextLessons);
    }
  }, [nextLessons]);

  useEffect(() => {
    if (refresh > 0) {
      // avoiding api calls on retake.
      getLesson();
      setRefresh(0);
    }
  }, [refresh]);

  useEffect(() => {
    (async () => {
      if (!lesson) {
        return;
      }

      try {
        const resp = await categoryService.GetLessonsByCategory({
          id: lesson.category.id,
          limit: 3,
        });

        const others = resp?.data.filter((item) => item.id !== lesson.id);
        setOtherLessons(others);
      } catch (error) {}
    })();
  }, [lesson]);

  useEffect(() => {
    if (!lesson) {
      return;
    }

    setLoading(false);
  }, [lesson, otherLessons]);

  const config = {
    navigation: {
      component: Nav, // a React component with special props provided automatically
      location: 'after', // or after
    },
  };

  const FirstStep = (props) => {
    return (
      <Hero
        points={lesson.max_points}
        {...props}
        setRefresh={setRefresh}
        nextLessons={nextLesson}
        course={course_id}
      />
    );
  };

  if (loading) {
    return <Loading />;
  }
  if (lesson.status === DELETED) {
    return (
      <div>
        <h2>{LESSON_DELETED}</h2>
      </div>
    );
  }

  return (
    <div>
      <PageTitle page={lesson?.title} pageModule="Training" />
      <div className="d-flex align-items-center justify-content-between">
        <Heading title={lesson?.title} pageHeaderDivider="pb-0 mb-0" />
        <CategoryPartnerLogo
          categoryInfo={lesson?.category}
          imageStyle="height-30 ml-1"
        />
      </div>
      <div className="page-header-divider mt-2 mb-3"></div>
      {lesson && (
        <Row className="mb-5">
          <Col className="m-auto col-sm-9 p-3">
            <Card className="card-lesson-hero">
              <CardBody>
                <Steps config={config}>
                  <Step
                    title={lesson.title}
                    lesson={lesson}
                    component={(props) => <FirstStep {...props} />}
                  />
                  {lesson.pages?.map((p, indx) => (
                    <Step
                      key={indx}
                      lessonId={lesson.id}
                      firstPage={lesson.pages[0]}
                      title={p.title}
                      component={(props) => (
                        <Page {...props} lesson={lesson} page={p} />
                      )}
                    />
                  ))}
                  <Step
                    title={CONGRATULATIONS}
                    lesson={lesson}
                    component={(props) => (
                      <Hero
                        {...props}
                        course={course_id}
                        nextLessons={nextLesson}
                        setRefresh={setRefresh}
                      />
                    )}
                  />
                </Steps>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
