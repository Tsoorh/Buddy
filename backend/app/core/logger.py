import logging
import sys

# format - time | level | filename | message
LOG_FORMAT = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"

def setup_logger(name: str):
    logger = logging.getLogger(name)
    
    if logger.hasHandlers():
        return logger
    
    logger.setLevel(logging.DEBUG)
    
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(logging.Formatter(LOG_FORMAT))
    logger.addHandler(console_handler)
    
    file_handler = logging.FileHandler("server.log", encoding="utf-8")
    file_handler.setFormatter(logging.Formatter(LOG_FORMAT))
    logger.addHandler(file_handler)
    
    return logger