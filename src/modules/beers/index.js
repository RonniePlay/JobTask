import { useEffect, useState } from "react";
import axios from "axios";
import { useStoreBeers } from "./store";
import styles from "./beersStyle.module.css";
import { Link } from "react-router-dom";

const Beers = () => {
  const data = useStoreBeers((state) => state.data);
  const isLoading = useStoreBeers((state) => state.isLoading);
  const addData = useStoreBeers((state) => state.addData);
  const updateData = useStoreBeers((state) => state.updateData);
  const removeData = useStoreBeers((state) => state.removeData);

  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(15);
  const [checkId, setCheckId] = useState([]);
  const [pageValue, setPageValue] = useState(1);

  const fetchData = async () => {
    const result = await axios.get(
      `https://api.punkapi.com/v2/beers?page=${pageValue}`
    );

    return result;
  };

  const fetchAdd = async () => {
    const result = await fetchData();
    addData(result.data);
    setPageValue(pageValue + 1);
  };

  const fetchUpdate = async () => {
    const result = await fetchData();
    updateData(result.data);
    setPageValue(pageValue + 1);
  };

  useEffect(() => {
    fetchAdd();
  }, []);

  useEffect(() => {
    if (data.length === 0 && !isLoading) {
      setEndIndex(25);
      fetchAdd();
    }
  }, [data]);

  const deleteBlock = () => {
    checkId.forEach((v) => {
      removeData(v);
      setEndIndex((prevEndIndex) => prevEndIndex + 1);
    });
    setCheckId([]);
  };

  const rightButtonClick = (e, id) => {
    e.preventDefault();

    if (checkId.includes(id)) {
      const temp = checkId.filter((v) => v !== id);
      setCheckId(temp);
      return;
    }

    setCheckId((prev) => [...prev, id]);
  };

  const handleScroll = (index, dataTemp) => {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollHeight - scrollTop === clientHeight) {
      if (dataTemp.length === index) {
        fetchUpdate();
      }

      setStartIndex((prev) => prev + 5);
      setEndIndex((prev) => prev + 5);
    }
  };

  useEffect(() => {
    const scrollHandler = () => {
      handleScroll(endIndex, data);
    };

    window.addEventListener("scroll", scrollHandler);

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, [endIndex, data]);

  return (
    <div>
      {checkId.length > 0 && <button onClick={deleteBlock}>Delete</button>}
      <div className={styles.container}>
        {data.slice(startIndex, endIndex).map((item) => (
          <Link
            to={`/${item.id}`}
            state={item}
            className={`${styles.block} ${
              checkId.includes(item.id) && styles.block_check
            }`}
            key={item.id}
            onContextMenu={(event) => rightButtonClick(event, item.id)}
          >
            <img src={item.image_url} />
            <div className={styles.info}>
              <div className={styles.block_info}>
                <div>Name:</div>
                <div>{item.name}</div>
              </div>
              <div className={styles.block_info}>
                <div>Description:</div>
                <div className={styles.description}>{item.description}</div>
              </div>
              <div className={styles.block_info}>
                <div>Tagline:</div>
                <div className={styles.tagline}>{item.tagline}</div>
              </div>
              <div className={styles.block_info}>
                <div>First brewed:</div>
                <div>{item.first_brewed}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Beers;
