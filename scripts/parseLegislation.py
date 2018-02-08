from __future__ import print_function
import os
import json
import xml.etree.ElementTree as ET
import pprint
import re
import csv

path = os.path.dirname(__file__)

def get_source():
    with open(os.path.join(path, '../source.json'), 'r') as source:
        return json.loads(source.read())


def to_float(input):
    try:
        return float(input.replace(',', ''))
    except ValueError:
        return None

numbers = re.compile('\d+(?:\.\d+)?')
def strip_alpha(input):
    return numbers.findall(input.replace(',', ''))[0]


def daily_rates(node, category_parse=lambda x: x):
    table = node.find(".//table")
    rows = table.findall('.//tbody/row')
    lines = []
    results = []
    for row in rows:
        cells = row.findall('.//entry')
        lines.append([ET.tostring(cell, 'utf8', 'text') for cell in cells])
    for line in lines:
        try:
            results.append({'category': category_parse(line[0]), 'rate': to_float(strip_alpha(line[2]))})
        except IndexError:
            pass
    return results


def time_allocations(node, columns = 5):
    table = node.find(".//table")
    rows = table.findall('.//tbody/row')
    lines = []
    results = []
    current_category = None
    for row in rows:
        cells = row.findall('.//entry')
        lines.append([ET.tostring(cell, 'utf8', 'text') for cell in cells])
    for line in lines:
        if len(line) == 1:
            continue
        if not line[0] and not line[1]:
            continue
        elif line[1] and not any([line[0]] + line[2:]):
            current_category = []
            results.append({'label': line[1], 'items': current_category})

        elif line[0] and (not any(line[1:]) or ''.join(line[1:]) == "ABC") and len(line) == columns:
            current_category = []
            results.append({'label': line[0], 'items': current_category})

        elif all(line[0:2]) and len(line) == 4:
            if current_category is None:
                current_category = []
                results.append({'label': 'Default', 'items': current_category, 'implicit': True})
            current_category.append({
                                    'costCode': line[0],
                                    'label': line[1],
                                    'explaination': line[3]
                                    })
        elif all(line[0:2] + line[3:]):
            if current_category is None:
                current_category = []
                results.append({'label': 'Default', 'items': current_category, 'implicit': True})
            values = {
                'costCode': line[0],
                'label': line[1],
                'A': to_float(line[3]),
                'B': to_float(line[4]),
            }
            if len(line) > 5:
                values['C'] = to_float(line[5])
            current_category.append(values)
    return results


def disbursements(table, params):
    rows = table.findall('.//tbody/row')
    parent_map = {}
    for el in table.iter():
        for child in el:
            parent_map[child] = el
    categories = []
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
            stack = [[]]
            categories.append({'label': ET.tostring(cells[0], 'utf8', 'text'), 'items': stack[0]})

        label_sub_code = None

        if row.findall('.//label'):
            for label in row.findall('.//label')[::-1]:
                label_sub_code = ET.tostring(label, 'utf8', 'text')
                # assume only one label per row, extract then remove
                parent_map[label].remove(label)

        code = ET.tostring(cells[params['code']], 'utf8', 'text')
        # if first for are empty, then its a subsubitem

        if not any(ET.tostring(cell, 'utf8', 'text') for cell in cells[0:4]) and ET.tostring(cells[params['label']], 'utf8', 'text'):
            stack[2].append({
                            'amount': cost(ET.tostring(cells[-1], 'utf8', 'text')) or category_cost,
                            'label': ET.tostring(cells[params['label']], 'utf8', 'text'),
                            'code': label_sub_code
                            })
        elif not code and label_sub_code:
            stack = [stack[0], stack[1], []]
            stack[1].append({
                            'amount': cost(ET.tostring(cells[-1], 'utf8', 'text')) or category_cost,
                            'label': ET.tostring(cells[params['label']], 'utf8', 'text'),
                            'code': label_sub_code,
                            'items': stack[2]
                            })
        elif code:
            stack = [stack[0], []]
            category_cost = cost(ET.tostring(cells[-1], 'utf8', 'text'))
            stack[0].append({
                            'amount': cost(ET.tostring(cells[-1], 'utf8', 'text')) or category_cost,
                            'label': ET.tostring(cells[params['label']], 'utf8', 'text'),
                            'code': code,
                            'items': stack[1]
                            })
    return categories


def parse_high_court():
    rules_tree = ET.parse(os.path.join(path, '../src/xml/High Court Rules.xml'))
    rules_root = rules_tree.getroot()

    fees_tree = ET.parse(os.path.join(path, '../src/xml/High Court Fees Regulations.xml'))
    fees_root = fees_tree.getroot()

    rate_id = "DLM6953317"
    rate_node = rules_root.findall(".//*[@id='%s']" % rate_id)[0]

    disbursements_id = "DLM5196182"
    disbursements_table = fees_root.findall(".//*[@id='%s']" % disbursements_id)[0]

    costs_id = "DLM6953320"
    costs_node = rules_root.findall(".//*[@id='%s']" % costs_id)[0]

    return {
        'costs': time_allocations(costs_node),
        'disbursements': disbursements(disbursements_table, {
            'label': -5,
            'code': -6
        }),
        'rates': daily_rates(rate_node)
    }



def parse_district_court():
    rules_tree = ET.parse(os.path.join(path, '../src/xml/District Court Rules.xml'))
    rules_root = rules_tree.getroot()

    rate_id = "DLM6122259"
    rate_node = rules_root.findall(".//*[@id='%s']" % rate_id)[0]

    costs_id = "DLM6122255"
    cost_node = rules_root.findall(".//*[@id='%s']" % costs_id)[0]

    fees_tree = ET.parse(os.path.join(path, '../src/xml/District Court Fees Regulations.xml'))
    fees_root = fees_tree.getroot()

    disbursements_id = "DLM5455655"
    disbursements_table = fees_root.findall(".//*[@id='%s']" % disbursements_id)[0]

    return {
        'rates': daily_rates(rate_node, strip_alpha),
        'costs': time_allocations(cost_node),
        'disbursements': disbursements(disbursements_table, {
            'label': -3,
            'code': -4
        })

    }

def parse_court_of_appeal_civil():
    rules_tree = ET.parse(os.path.join(path, '../src/xml/High Court Rules.xml'))
    rules_root = rules_tree.getroot()

    rate_id = "DLM6953317"
    rate_node = rules_root.findall(".//*[@id='%s']" % rate_id)[0]

    high_court_rates = daily_rates(rate_node)[1:]

    rules_tree = ET.parse(os.path.join(path, '../src/xml/Court of Appeal - Civil.xml'))
    rules_root = rules_tree.getroot()

    costs_id = "DLM1411321"
    cost_node = rules_root.findall(".//*[@id='%s']" % costs_id)[0]

    fees_tree = ET.parse(os.path.join(path, '../src/xml/Court of Appeal Fees Regulations.xml'))
    fees_root = fees_tree.getroot()

    disbursements_id = "DLM5455742"
    disbursements_table = fees_root.findall(".//*[@id='%s']" % disbursements_id)[0]

    return {
        'costs': time_allocations(cost_node, 4),
        'disbursements': disbursements(disbursements_table, {
            'label': -3,
            'code': -4
        }),
        'rates': [{
            "category": "Simple",
            'rate': filter(lambda x: x["category"] == '2', high_court_rates)[0]["rate"]
        }, {
            "category": "Complex",
            'rate': filter(lambda x: x["category"] == '3', high_court_rates)[0]["rate"]
        }]
    }

def parse_employment_court():
    rules_tree = ET.parse(os.path.join(path, '../src/xml/High Court Rules.xml'))
    rules_root = rules_tree.getroot()
    rate_id = "DLM6953317"
    rate_node = rules_root.findall(".//*[@id='%s']" % rate_id)[0]

    cost_results = []
    current_category = None

    with open(os.path.join(path, '../src/xml/Employment Court Scale Costs.csv')) as csv_file:
        reader = csv.reader(csv_file)
        for line in reader:
            if not line[0]:
                current_category = []
                cost_results.append({'label': line[1], 'items': current_category})
            else:
                current_category.append({
                    'costCode': line[0],
                    'label': line[1],
                    'A': to_float(line[2]),
                    'B': to_float(line[3]),
                    'C': to_float(line[4]),
                })

    fees_tree = ET.parse(os.path.join(path, '../src/xml/Employment Court Regulations.xml'))
    fees_root = fees_tree.getroot()
    disbursements_id = "DLM2034902"
    disbursements_table = fees_root.findall(".//*[@id='%s']//table" % disbursements_id)[0]
    disbursements = []

    parent_map = {}
    for el in disbursements_table.iter():
        for child in el:
            parent_map[child] = el

    rows = disbursements_table.findall('.//tbody/row')
    code = None
    for row in rows:
        if row.findall('.//label'):
            for label in row.findall('.//label')[::-1]:
                code = ET.tostring(label, 'utf8', 'text')
                # assume only one label per row, extract then remove
                parent_map[label].remove(label)
        cells = row.findall('.//entry')
        disbursements.append({
                            'amount': to_float(ET.tostring(cells[1], 'utf8', 'text')),
                            'label': ET.tostring(cells[0], 'utf8', 'text'),
                            'code': code,
                            'items': []
                        })

    return {
        'costs': cost_results,
        'disbursements': disbursements,
        'rates': daily_rates(rate_node)
    }


def save_result(data, filename):
    with open(os.path.join(path, '../src/js/data/%s.json' % filename), 'wb') as out:
        out.write(json.dumps(data))

if __name__ == '__main__':
    save_result(parse_high_court(), 'High Court')
    save_result(parse_district_court(), 'District Court')
    save_result(parse_court_of_appeal_civil(), 'Court of Appeal - Civil')
    save_result(parse_employment_court(), 'Employment Court')
    print('Everything parsed')



