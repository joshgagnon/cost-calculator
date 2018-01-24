import os
import requests
import json
import xml.etree.ElementTree as ET

path = os.path.dirname(__file__)

def get_source():
    with open(os.path.join(path, '../source.json'), 'r') as source:
        return json.loads(source.read())


def to_float(input):
    try:
        return float(input.replace(',', ''))
    except ValueError:
        return None



def parse_high_court():
    tree = ET.parse(os.path.join(path, '../src/xml/High Court.xml'))
    root = tree.getroot()

    def daily_rates():
        xml_id = "DLM6953317"
        node = root.findall(".//*[@id='%s']" % xml_id)[0]
        table = node.find(".//table")
        rows = table.findall('.//tbody/row')[1:]
        lines = []
        results = []
        for row in rows:
            cells = row.findall('.//entry')
            lines.append([ET.tostring(cell, 'utf8', 'text') for cell in cells])
        for line in lines:
            results.append({'category': line[0], 'rate': to_float(line[2])})
        return results

    def time_allocations():
        xml_id = "DLM6953320"
        node = root.findall(".//*[@id='%s']" % xml_id)[0]
        table = node.find(".//table")
        rows = table.findall('.//tbody/row')
        lines = []
        results = []
        current_category = None
        for row in rows:
            cells = row.findall('.//entry')
            lines.append([ET.tostring(cell, 'utf8', 'text') for cell in cells])
        for line in lines:
            if not line[0] and not line[1]:
                pass
            elif line[1] and not any([line[0]] + line[2:]):
                current_category = []
                results.append({'label': line[1], 'items': current_category})
            elif all(line[0:2]) and len(line) == 4:
                current_category.append({
                                        'allocationCode': line[0],
                                        'label': line[1],
                                        'explaination': line[3]
                                        })
            elif all(line[0:2] + line[3:]):
                current_category.append({
                                        'allocationCode': line[0],
                                        'label': line[1],
                                        'A': to_float(line[3]),
                                        'B': to_float(line[4]),
                                        'C': to_float(line[5]),
                                        })
        return results
    return {
        'allocations': time_allocations(),
        'rates': daily_rates()
    }




def save_result(data, filename):
    with open(os.path.join(path, '../src/js/data/%s.json' % filename), 'wb') as out:
        out.write(json.dumps(data))

if __name__ == '__main__':
    save_result(parse_high_court(), 'High Court')



