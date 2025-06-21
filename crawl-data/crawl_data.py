from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import csv
from bs4 import BeautifulSoup
import requests
from time import sleep
import re
import unicodedata

def crawl_product_list(output_csv="product.csv", base_url="https://shop.webthethao.vn/collections/all", timeout=5):
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    products_data = []
    product_links = []
    
    # Giới hạn số sản phẩm mỗi danh mục
    # CATEGORY_LIMIT = 15
    # category_count = {
    #     "Bóng rổ": 0,
    #     "Bóng chuyền": 0,
    #     "Cầu lông": 0,
    #     "Bi-a": 0,
    #     "Bóng đá & Futsal": 0,
    #     "Pickleball": 0,
    #     "Khác": 0
    # }
    
    fieldnames = ["title", "img_urls", "category", "description", "price", "detail_url"]

    try:
        driver.get(base_url)

        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.col-6.col-xs-6.col-sm-6.col-md-4.col-lg-3.col-xl-3"))
        )

        product_divs = driver.find_elements(By.CSS_SELECTOR, "div.col-6.col-xs-6.col-sm-6.col-md-4.col-lg-3.col-xl-3")
        print(f"[INFO] Tìm thấy {len(product_divs)} sản phẩm")

        for idx, product in enumerate(product_divs, 1):
            try:
                item_product_main = product.find_element(By.CSS_SELECTOR, "div.item_product_main")
                product_info = item_product_main.find_element(By.CSS_SELECTOR, "div.product-info")
                product_name = product_info.find_element(By.CSS_SELECTOR, "h3.product-name a")
                
                # Lấy ra tên sản phẩm
                # title = exclude_word(title=product_name.text.strip()) 
                title = title=product_name.text.strip()
                
                # Lấy ra giá thành sản phẩm
                product_price = product_info.find_element(By.CSS_SELECTOR, "div.price-box span.price").text.strip()
                
                # Lấy ra danh mục bằng cách xác định tên
                # category = get_category_info(title)
                category="Chạy bộ"
                
                # if category_count[category] >= CATEGORY_LIMIT:
                #     continue
                
                # Truy cập trang chi tiết sản phẩm
                detail_url = product_name.get_attribute("href")

                product_links.append({
                    "title": title,
                    "category": category,
                    "price": product_price,
                    "detail_url": detail_url,
                })
                
                # category_count[category] += 1
            except Exception as e:
                print(f"[WARN] Lỗi khi xử lý sản phẩm #{idx}: {e}")


        # Crawl chi tiết từng sản phẩm
        for idx, prod in enumerate(product_links, 1):
            try:
                print(f"[INFO] Đang xử lý sản phẩm #{idx}: {prod['title']} - Danh mục: {prod["category"]} - Giá: {prod["price"]}")
                
                # gọi hàm để lấy toàn bộ dường dẫn hình ảnh bên trong trang đó 
                detail_img_url = get_image_info(prod["detail_url"], driver)
                
                # lấy mô tả sản phẩm ra 
                # description = replace_keyword(get_description_info(prod["detail_url"], driver))
                description = get_description_info(prod["detail_url"], driver)
                
                # tạm đừng khoảng 3 giây để trang web không nhận biết mình là bot
                sleep(3)
                
                products_data.append({
                    "title": prod["title"],
                    "detail_url": prod["detail_url"],
                    "img_urls": detail_img_url,
                    "price": prod["price"],
                    "category": prod["category"],
                    "description": description
                })
            except Exception as e:
                print(f"[WARN] Lỗi khi xử lý chi tiết sản phẩm #{idx}: {e}")
        
        # Ghi ra CSV
        with open(output_csv, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(products_data)

        print(f"[SUCCESS] Đã ghi {len(products_data)} sản phẩm vào {output_csv}")
        return products_data

    except Exception as e:
        print(f"[ERROR] Lỗi khi crawl trang chính: {e}")
        return []

    finally:
        driver.quit()

def get_image_info(url, driver, timeout=10):
    try:
        driver.get(url)

        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.product-image-block.relative"))
        )

        # Tìm ảnh lớn trong trang chi tiết
        main_img_element = driver.find_element(By.CSS_SELECTOR,
            "div.swiper-container.gallery-top.swiper-container-initialized.swiper-container-horizontal.swiper-container-pointer-events #lightgallery a img"
        )
        
        main_data_img = main_img_element.get_attribute("data-image")
        img_urls = "https:" + main_data_img if main_data_img and main_data_img.startswith("//") else main_data_img
        
        slide_img_elements = driver.find_elements(By.CSS_SELECTOR, "div.swiper-slide[data-hash]")
        
        for slide in slide_img_elements:
          slide_img_element = slide.find_element(By.CSS_SELECTOR, "div img").get_attribute("data-image")
          
          slide_img_url = "https:" + slide_img_element if slide_img_element and slide_img_element.startswith("//") else slide_img_element
          
          img_urls = img_urls + f"; {slide_img_url}"
          
        # print(f"Img urls info: ${img_urls}")
          
        return img_urls
    
    except Exception as e:
        print(f"[ERROR] Lỗi khi crawl chi tiết {url}: {e}")
        return None

def get_description_info(url, driver, timeout=10):
    try:
        driver.get(url)
        
        # Cố gắng chờ div#content xuất hiện trong timeout
        try:
            WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((By.ID, "content"))
            )
            
            # Lấy phần tử div có id content
            content_div = driver.find_element(By.ID, "content")

            # Dùng BeautifulSoup để lấy lại nội dung HTML/text sạch hơn
            soup = BeautifulSoup(content_div.get_attribute("innerHTML"), "html.parser")

            # Option 1: Lấy toàn bộ nội dung thô dạng text (không HTML tag)
            plain_text = soup.get_text(separator="; ", strip=True)
            # print(f"PLain text: ${plain_text}")
            
            return plain_text
        except: 
            # Nếu div#content không có, thử tìm div.rte.product_getcontent
            try:
                fallback_div = driver.find_element(By.CSS_SELECTOR, "div.rte.product_getcontent")
                fallback_soup = BeautifulSoup(fallback_div.get_attribute("innerHTML"), "html.parser")
                fallback_text = fallback_soup.get_text(separator="; ", strip=True)
                return fallback_text
              
            except:
                # Nếu fallback cũng không có thì trả về chuỗi rỗng
                return ""
        
    except Exception as e:
        print(f"[ERROR] Lỗi khi crawl chi tiết {url}: {e}")
        return None

def get_category_info(name):
    name = name.lower()

    if "bóng rổ" in name:
        return "Bóng rổ"
    elif "bóng chuyền" in name:
        return "Bóng chuyền"
    elif "cầu lông" in name:
        return "Cầu lông"
    elif "bi-a" in name or "bida" in name:
        return "Bi-a"
    elif "futsal" in name or "bóng đá" in name:
        return "Bóng đá & Futsal"
    elif "pickleball" in name:
        return "Pickleball"
    else:
        return "Khác"
  
def exclude_word(title, keyword="cầu lông /"):
    # Chuẩn hóa để tránh lỗi ký tự Unicode
    title = unicodedata.normalize("NFKC", title)
    keyword = unicodedata.normalize("NFKC", keyword)

    # Tạo regex pattern không phân biệt hoa thường
    pattern = re.compile(re.escape(keyword), re.IGNORECASE)

    # Thay thế và dọn chuỗi
    cleaned = pattern.sub("", title)
    cleaned = re.sub(r"\s{2,}", " ", cleaned)       # Xóa khoảng trắng dư
    cleaned = re.sub(r"\s*/\s*", " / ", cleaned)     # Dọn dấu /
    return cleaned.strip()

def replace_keyword(content, keyword="cầu lông", replace_word="bóng chuyền"):
    # Normalize Unicode để tránh lỗi dấu hoặc ký tự lạ
    content = unicodedata.normalize("NFKC", content)
    keyword = unicodedata.normalize("NFKC", keyword)
    replace_word = unicodedata.normalize("NFKC", replace_word)

    # Compile regex không phân biệt hoa thường
    pattern = re.compile(re.escape(keyword), re.IGNORECASE)

    # Thay thế keyword bằng replace_word
    return pattern.sub(replace_word, content)

if __name__ == "__main__":
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    # crawl_product_list(base_url="https://shop.webthethao.vn/quan-ao-tap-gym?q=collections:3198753&page=2&view=grid", output_csv="gym.csv")
    
    get_description_info(url='https://paddy.vn/products/thuc-an-cho-meo-royal-canin-indoor-27', driver=driver, timeout=10)