import os
import json
import xml.etree.ElementTree as ET
import pprint

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
    rules_tree = ET.parse(os.path.join(path, '../src/xml/High Court Rules.xml'))
    rules_root = rules_tree.getroot()

    fees_tree = ET.parse(os.path.join(path, '../src/xml/High Court Fees Regulations.xml'))
    fees_root = fees_tree.getroot()

    def daily_rates():
        xml_id = "DLM6953317"
        node = rules_root.findall(".//*[@id='%s']" % xml_id)[0]
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
        node = rules_root.findall(".//*[@id='%s']" % xml_id)[0]
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
                                        'costCode': line[0],
                                        'label': line[1],
                                        'explaination': line[3]
                                        })
            elif all(line[0:2] + line[3:]):
                current_category.append({
                                        'costCode': line[0],
                                        'label': line[1],
                                        'A': to_float(line[3]),
                                        'B': to_float(line[4]),
                                        'C': to_float(line[5]),
                                        })
        return results

    def disbursements():
        xml_id = "DLM5196182"
        table = fees_root.findall(".//*[@id='%s']" % xml_id)[0]
        rows = table.findall('.//tbody/row')
        parent_map = {}
        for el in table.iter():
            for child in el:
                parent_map[child] = el
        category_rows = 0
        categories = []
        current_category = None
        current_sub_items = None
        category_cost = None
        stack = []

        def cost(value):
            try:
                return float(value.replace(',', ''))
            except ValueError:
                return value


        for row in rows:
            if not ET.tostring(row, 'utf8', 'text'):
                continue

            cells = row.findall('.//entry')
            if cells[0].attrib.get('morerows'):
                category_rows = int(cells[0].attrib.get('morerows'))
                stack = [[]]
                categories.append({'label': ET.tostring(cells[0], 'utf8', 'text'), 'items': stack[0]})

                category_cost = cost(ET.tostring(cells[-1], 'utf8', 'text'))
            label_sub_code = None

            if cells[-5].findall('.//label'):
                for label in cells[-5].findall('.//label'):
                    label_sub_code = ET.tostring(label, 'utf8', 'text')
                    # assume only one label per row, extract then remove
                    parent_map[label].remove(label)

            # if first for are empty, then its a subsubitem
            if not any(ET.tostring(cell, 'utf8', 'text') for cell in cells[0:4]):
                stack[2].append({
                                'amount': cost(ET.tostring(cells[-1], 'utf8', 'text')) or category_cost,
                                'label': ET.tostring(cells[-5], 'utf8', 'text'),
                                'code': label_sub_code
                                })
            elif label_sub_code:
                stack[2] = []
                stack[1].append({
                                'amount': cost(ET.tostring(cells[-1], 'utf8', 'text')) or category_cost,
                                'label': ET.tostring(cells[-5], 'utf8', 'text'),
                                'code': label_sub_code,
                                'subItems': stack[2]
                                })
            else:
                stack[1] = []
                stack[0].append({
                                'amount': cost(ET.tostring(cells[-1], 'utf8', 'text')) or category_cost,
                                'label': ET.tostring(cells[-5], 'utf8', 'text'),
                                'code': ET.tostring(cells[-6], 'utf8', 'text'),
                                'subItems': stack[1]
                                })

        pp = pprint.PrettyPrinter(indent=4)
        pp.pprint(categories)
        return categories


    return {
        'costs': time_allocations(),
        'disbursements': disbursements(),
        'rates': daily_rates()
    }




def save_result(data, filename):
    with open(os.path.join(path, '../src/js/data/%s.json' % filename), 'wb') as out:
        out.write(json.dumps(data))

if __name__ == '__main__':
    save_result(parse_high_court(), 'High Court')



